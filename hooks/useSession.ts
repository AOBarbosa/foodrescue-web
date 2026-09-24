import { useCallback, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearSession, getSession, subscribeSession, type Session } from "@/lib/auth/session";

/** Current session; `null` on the server and while logged out. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, () => null);
}

/** Ends the session and drops every cached query of the account. */
export function useLogout(): () => void {
  const queryClient = useQueryClient();
  return useCallback(() => {
    clearSession();
    queryClient.clear();
  }, [queryClient]);
}
