import { useQuery } from '@tanstack/react-query'
import { checkoutKeys } from '@/features/checkout/hooks/checkoutKeys'
import { getPlacedOrder } from '@/features/checkout/services/checkoutService'

/** The order just placed, for the confirmation page. */
export function useOrderConfirmation(orderNumber) {
  return useQuery({ queryKey: checkoutKeys.order(orderNumber), queryFn: () => getPlacedOrder(orderNumber) })
}
