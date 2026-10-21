/**
 * Kept apart from `session.ts` so `proxy.ts` (which runs before rendering,
 * outside the browser) can read the cookie name without pulling in js-cookie.
 */
export const TOKEN_COOKIE = 'fr_token'
export const SESSION_COOKIE = 'fr_session'

export const ESTABLISHMENT_LOGIN_PATH = '/establishment/login'
export const ESTABLISHMENT_HOME_PATH = '/dashboard/products'

export const CONSUMER_LOGIN_PATH = '/consumer/login'
export const CONSUMER_REGISTER_PATH = '/consumer/register'
export const CONSUMER_HOME_PATH = '/offers'
export const CONSUMER_ORDERS_PATH = '/orders'
