import { vi } from "vitest";

/** Spies behind the `next/navigation` mock; reset them in `beforeEach`. */
export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
};

export const navigationMock = {
  useRouter: () => router,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
};
