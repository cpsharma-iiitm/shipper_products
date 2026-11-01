import { endpoints, http } from '@/app/services'

/**
 * Places an order for the cart. The backend re-prices it and rejects it (409) when `expectedPayable` is no
 * longer what it would charge, so the customer never pays an amount they have not seen.
 * ASSUMPTION — confirm with backend team. Request:
 *   { items: [{ productCode, quantity }], couponCode?, useWallet, addressId, contact: { name, mobile, email },
 *     alternateMobile?, deliveryInstructions?, expectedPayable }
 * Response (201): { orderNumber, paymentStatus: 'pending' | 'paid', amountDue, currency }
 */
export async function placeOrder(payload) {
  const { data } = await http.post(endpoints.checkout.placeOrder, payload)
  return data
}

/**
 * The placed order for the confirmation page.
 * ASSUMPTION — confirm with backend team: the order shape of the orders API, plus `delivery`
 * { method, etaFrom, etaTo }. This can move to the shared orders endpoint once that returns the same data.
 */
export async function getPlacedOrder(orderNumber) {
  const { data } = await http.get(endpoints.checkout.order(orderNumber))
  return data
}
