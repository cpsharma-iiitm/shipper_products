import { endpoints, http } from '@/app/services'

/**
 * Quote for the cart (or a checkout / purchase). The backend calculates every figure; the client only
 * sends what the customer chose.
 * ASSUMPTION — confirm with backend team (B-01, B-03, B-04). Request:
 *   { items: [{ productCode, quantity }], couponCode?, useWallet?, pin?, addressId? }
 * Response: { lines[], summary{ units, products, itemsTotal, taxableSubtotal, gstTotal, cgst, sgst, igst,
 *   shipping, grossAmount, couponDiscount, walletApplied, payable, freeShippingThreshold, awayFromFreeShipping },
 *   wallet{ balance, eligible, maxPerOrder, applied, balanceAfter }, coupon{ code, valid, message, discount } | null,
 *   delivery{ pin, serviceable, city, method, fee, etaFrom, etaTo } }
 */
export async function getCartQuote(payload) {
  const { data } = await http.post(endpoints.cart.quote, payload)
  return data
}
