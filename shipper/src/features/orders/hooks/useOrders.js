import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getOrder, listOrders } from '@/features/orders/services/orderService'

export const orderKeys = {
  all: ['orders'],
  list: (filters) => ['orders', 'list', filters],
  detail: (orderNumber) => ['orders', 'detail', orderNumber],
}

/** One page of the signed-in customer's orders. The previous page stays visible while the next one loads. */
export function useOrders(filters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => listOrders(filters),
    placeholderData: keepPreviousData,
    // An order placed since the list was last shown must appear, so the list is always refreshed on entry.
    refetchOnMount: 'always',
  })
}

export function useOrder(orderNumber) {
  return useQuery({ queryKey: orderKeys.detail(orderNumber), queryFn: () => getOrder(orderNumber) })
}
