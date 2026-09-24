import { NextResponse, type NextRequest } from "next/server";
import { ESTABLISHMENT_LOGIN_PATH, TOKEN_COOKIE } from "@/lib/auth/constants";

/**
 * Optimistic guard for the establishment dashboard: no token cookie, no page.
 * It only checks presence — the backend still validates the token on every
 * request (an expired one yields 401 and the client clears the session).
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ESTABLISHMENT_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/dashboard/:path*",
};
