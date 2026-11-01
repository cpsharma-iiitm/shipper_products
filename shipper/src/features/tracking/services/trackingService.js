import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. Public lookup, no sign-in: send either
//   { orderNumber, mobile }  (the mobile number on the order) or { consignmentId }
// and receive only the shipment's progress — never names, addresses or prices:
//   { orderNumber, placedAt, status, units, estimatedDelivery, deliveredAt,
//     shipment: { carrier, service, consignmentId, trackingUrl, lastUpdate } | null,
//     timeline: [{ key, title, at, note, state: 'done' | 'current' | 'upcoming' }] }
// A wrong combination is a 404 with a generic message, so the lookup does not reveal which orders exist.
// POST rather than GET keeps the mobile number out of URLs and server logs.
export async function trackShipment(payload) {
  const { data } = await http.post(endpoints.orders.track, payload)
  return data
}
