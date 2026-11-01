import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getShipments } from '@/features/shipping/services/shippingService'

export const shippingKeys = {
  all: ['admin', 'shipments'],
  list: (params) => [...shippingKeys.all, 'list', params],
}

export function useShipments(params) {
  return useQuery({ queryKey: shippingKeys.list(params), queryFn: () => getShipments(params), placeholderData: keepPreviousData })
}
