import { type ReactNode, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * Single place to compose the app's top-level providers:
 *   - ErrorBoundary catches render-time crashes
 *   - ThemeProvider shares light/dark state across the entire tree
 *   - QueryClientProvider gives every component access to shared data cache
 *   - BrowserRouter enables URL-driven filter state + back/forward navigation
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 60_000,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={client}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
