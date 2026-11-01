import { endpoints, http } from '@/app/services'

/**
 * Delivery check for a PIN code.
 * ASSUMPTION — confirm with backend team. Expected response:
 *   { pin, city, state, serviceable, etaMinDays, etaMaxDays, shippingMethod, shippingFee }
 */
export async function checkServiceability(pin) {
  const { data } = await http.get(endpoints.catalog.serviceability, { params: { pin } })
  return data
}
