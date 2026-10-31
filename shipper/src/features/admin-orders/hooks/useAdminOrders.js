import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelAdminOrder, getAdminOrder, listAdminOrders } from '@/features/admin-orders/services/adminOrderService'

export const adminOrderKeys = {
  all: ['admin', 'orders'],
  list: (params) => ['admin', 'orders', 'list', params],
  detail: (orderNumber) => ['admin', 'orders', 'detail', orderNumber],
}

export const useAdminOrders = (params) =>
  useQuery({ queryKey: adminOrderKeys.list(params), queryFn: () => listAdminOrders(params), placeholderData: keepPreviousData })

export const useAdminOrder = (orderNumber) => useQuery({ queryKey: adminOrderKeys.detail(orderNumber), queryFn: () => getAdminOrder(orderNumber) })

// Cancelling frees stock, queues and wallet balances elsewhere in the admin, so every admin query is refreshed.
export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelAdminOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(adminOrderKeys.detail(order.orderNumber), order)
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}
