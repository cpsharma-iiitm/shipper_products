import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. The order list returns lightweight summaries:
//   { items: [{ orderNumber, placedAt, status, grossAmount, units, items: [{ productCode, name, shortName?, quantity, image }],
//                estimatedDelivery, carrier, deliveredAt, refund, hasInvoice, canReorder }],
//     page, pageSize, totalItems, pageCount }
// and the detail returns the full order the customer may see:
//   { orderNumber, placedAt, status, paymentStatus, paymentMethod, razorpayPaymentId, invoiceNumber, estimatedDelivery,
//     deliveredAt, lines: [{ productCode, slug, name, unit, quantity, lineTotal, image, available }], summary, address,
//     deliveryInstructions, shipment: { carrier, service, consignmentId, trackingUrl, lastUpdate } | null,
//     timeline: [{ key, title, at, note, state }], refund, canReorder }
// `summary` holds the figures stored with the order (taxableSubtotal, gstTotal, shipping, grossAmount, couponDiscount,
// walletApplied, payable); the screens display them exactly as received. A customer asking for someone else's order gets 404.

export async function listOrders({ page, pageSize, status, period, q }) {
  const { data } = await http.get(endpoints.orders.list, {
    params: { page, pageSize, status: status === 'all' ? undefined : status, period, q: q || undefined },
  })
  return data
}

export async function getOrder(orderNumber) {
  const { data } = await http.get(endpoints.orders.detail(orderNumber))
  return data
}
