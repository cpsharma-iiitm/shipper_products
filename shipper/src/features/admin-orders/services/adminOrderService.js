import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. An order list row is
//   { orderNumber, placedAt, customerCode, customerName, customerMobile, units, grossAmount, walletApplied, payable,
//     paymentStatus, paymentMethod, status, delayed, onHold }

/**
 * GET orders (q: order number, customer name / code / mobile · status · payment · range: all | today | … | custom
 * with from and to · sort: 'field' | '-field' · page · pageSize) →
 *   { items, page, pageSize, totalItems, pageCount, counts: { all, new, to_pick, … } }
 * `counts` are per status for the search, payment and date filters (ignoring the status filter), for the summary cards.
 */
export async function listAdminOrders(params) {
  const { data } = await http.get(endpoints.admin.orders.list, { params })
  return data
}

/**
 * GET one order → the stored order (lines with HSN, GST and amounts, summary, address, payment, fulfilment,
 * shipment, timestamps) plus
 *   timeline: [{ key, title, at, note, state: 'done' | 'current' | 'upcoming' }],
 *   refund: { amount, to, at, reason, walletAmount } | null,
 *   canCancel: boolean            (the backend's rule: only new and to-pick orders),
 *   fulfilmentTab: string | null  (the Store Operation tab the order is in).
 */
export async function getAdminOrder(orderNumber) {
  const { data } = await http.get(endpoints.admin.orders.item(orderNumber))
  return data
}

/** POST cancel { reason: customer_request | payment_issue | out_of_stock | duplicate_order | other } → the updated order. 409 when it is too late. */
export async function cancelAdminOrder({ orderNumber, reason }) {
  const { data } = await http.post(endpoints.admin.orders.cancel(orderNumber), { reason })
  return data
}
