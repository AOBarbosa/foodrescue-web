import { useSyncExternalStore } from "react";
import { getSession, subscribeSession, type Session } from "@/lib/auth/session";

/** Current session; `null` on the server and while logged out. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}
