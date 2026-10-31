import { QueryClient } from '@tanstack/react-query'
// Client errors (4xx) will not succeed on retry; network and server errors get two more attempts.
function shouldRetry(failureCount, error) {
  const status = error?.status
  if (status >= 400 && status < 500) return false
  return failureCount < 2
}
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})