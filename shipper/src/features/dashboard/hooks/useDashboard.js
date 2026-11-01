import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/features/dashboard/services/dashboardService'

export const dashboardKeys = {
  all: ['admin', 'dashboard'],
  period: (period) => ['admin', 'dashboard', period],
}

/** Dashboard aggregates for a reporting period. Refreshes every minute; the previous period stays on screen while a new one loads. */
export function useDashboard(period) {
  return useQuery({
    queryKey: dashboardKeys.period(period),
    queryFn: () => getDashboard(period),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  })
}
