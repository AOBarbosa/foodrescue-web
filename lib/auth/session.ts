import Cookies from "js-cookie";
import { SESSION_COOKIE, TOKEN_COOKIE } from "./constants";

/**
 * Who is logged in, as returned by the register/login endpoints. The JWT is
 * never decoded on the client: this is what the API handed back, persisted.
 */
export type Session = {
  role: "ESTABLISHMENT";
  id: number;
  name: string;
};

/**
 * Token and session live in JS-readable cookies (the backend sets none), so
 * `proxy.ts` can guard the dashboard before rendering and the Axios
 * interceptor can read the token. Swapping this for localStorage only means
 * changing this file.
 */
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  expires: 1,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
};

const listeners = new Set<() => void>();
const expiredListeners = new Set<() => void>();

// useSyncExternalStore needs the same object back while nothing changed.
let cachedRaw: string | undefined;
let cachedSession: Session | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function getSession(): Session | null {
  const raw = Cookies.get(SESSION_COOKIE);
  if (raw === cachedRaw) return cachedSession;

  cachedRaw = raw;
  try {
    cachedSession = raw && getToken() ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function setSession(token: string, session: Session): void {
  Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
  Cookies.set(SESSION_COOKIE, JSON.stringify(session), COOKIE_OPTIONS);
  notify();
}

/** Updates the stored profile without touching the token (e.g. after a rename). */
export function updateSession(patch: Partial<Omit<Session, "role" | "id">>): void {
  const current = getSession();
  if (!current) return;
  Cookies.set(SESSION_COOKIE, JSON.stringify({ ...current, ...patch }), COOKIE_OPTIONS);
  notify();
}

export function clearSession(): void {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
  Cookies.remove(SESSION_COOKIE, { path: "/" });
  notify();
}

/**
 * Ends the session because the backend rejected the token (not because the
 * user chose to leave), so whoever is showing private content can react.
 */
export function expireSession(): void {
  clearSession();
  expiredListeners.forEach((listener) => listener());
}

export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
