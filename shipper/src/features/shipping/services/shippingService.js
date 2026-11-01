import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. GET /admin/shipments?search&status&page&pageSize answers
//   { items: QueueRow[] (see store-operations service), page, pageSize, totalItems, pageCount,
//     summary: { total, byStatus: { dispatched, in_transit, out_for_delivery, delivered, returned },
//                windowDays, carrier, syncedAt } }
// covering shipments dispatched in the last `windowDays` days, newest first.
export async function getShipments(params) {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== 'all'))
  const { data } = await http.get(endpoints.admin.shipping.shipments, { params: cleaned })
  return data
}
