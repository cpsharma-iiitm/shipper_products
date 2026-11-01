import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '@/features/dashboard/services/notificationService'

export const notificationKeys = { all: ['admin', 'notifications'] }

export function useNotifications() {
  return useQuery({ queryKey: notificationKeys.all, queryFn: getNotifications, refetchInterval: 60_000 })
}
