import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { render, renderHook } from "@testing-library/react";
import { theme } from "@/lib/theme";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, queryClient = createTestQueryClient()) {
  return { queryClient, ...render(ui, { wrapper: wrapperFor(queryClient) }) };
}

export function renderHookWithProviders<T>(hook: () => T, queryClient = createTestQueryClient()) {
  return { queryClient, ...renderHook(hook, { wrapper: wrapperFor(queryClient) }) };
}
