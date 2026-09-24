import { QueryClient } from "@tanstack/react-query";
import { AppError } from "@/lib/api/errors";

/** Errors that retrying cannot fix: the request itself is wrong or not allowed. */
function isRetryable(error: unknown): boolean {
  if (!(error instanceof AppError)) return true;
  return error.status === 0 || error.status >= 500;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => failureCount < 2 && isRetryable(error),
      },
      mutations: { retry: false },
    },
  });
}
