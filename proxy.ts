import { type NextRequest, NextResponse } from 'next/server'

import {
  CONSUMER_HOME_PATH,
  CONSUMER_LOGIN_PATH,
  ESTABLISHMENT_HOME_PATH,
  ESTABLISHMENT_LOGIN_PATH,
  SESSION_COOKIE,
  TOKEN_COOKIE,
} from '@/lib/auth/constants'

function readRole(
  request: NextRequest
): 'ESTABLISHMENT' | 'CONSUMER' | undefined {
  const raw = request.cookies.get(SESSION_COOKIE)?.value
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as { role?: unknown }
    if (parsed.role === 'ESTABLISHMENT' || parsed.role === 'CONSUMER') {
      return parsed.role
    }
  } catch {
    // Malformed session cookie falls back to token presence check.
  }
  return undefined
}

/**
 * Optimistic guard for the establishment dashboard and the consumer portal:
 * no token cookie, no page. It also prevents an establishment session from
 * wandering into consumer-only routes (and vice-versa), while the backend
 * still validates the token and role on every request.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isConsumerRoute =
    pathname.startsWith('/offers') || pathname.startsWith('/orders')
  const hasToken = request.cookies.has(TOKEN_COOKIE)

  if (!hasToken) {
    const loginPath = isConsumerRoute
      ? CONSUMER_LOGIN_PATH
      : ESTABLISHMENT_LOGIN_PATH
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = readRole(request)
  if (isConsumerRoute && role === 'ESTABLISHMENT') {
    return NextResponse.redirect(new URL(ESTABLISHMENT_HOME_PATH, request.url))
  }
  if (!isConsumerRoute && role === 'CONSUMER') {
    return NextResponse.redirect(new URL(CONSUMER_HOME_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/offers/:path*', '/orders/:path*'],
}
