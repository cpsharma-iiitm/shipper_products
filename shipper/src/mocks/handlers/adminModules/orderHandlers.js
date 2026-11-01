// DEV FIXTURES — admin order management for the mock API. Read-only except cancelling a new or to-pick order;
// every other fulfilment step (verify, pick, pack, dispatch) belongs to the Store Operation endpoints.
// ASSUMPTION — confirm with backend team: paths, query parameters, payloads and the cancellation rule.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getCustomer, getOrder, withLineImages } from '@/mocks/db'
import { requireAdmin } from '@/mocks/lib/auth'
import { matchesText, sortBy } from '@/mocks/lib/paginate'
import { buildCustomerTimeline } from '@/mocks/lib/timeline'
import { inRange, listResponse, nowIso, resolveRange } from './shared'
 
const CANCELLABLE = ['new', 'to_pick']
const CANCEL_REASONS = ['customer_request', 'payment_issue', 'out_of_stock', 'duplicate_order', 'other']
 
/** The Store Operation tab an order currently sits in (ASSUMPTION: tab keys follow the design's tab names). */
function fulfilmentTab(order) {
  if (order.delay) return 'delayed'
  const tabs = {
    new: 'new-orders',
    to_pick: 'to-pick',
    to_pack: 'to-pack',
    packed: 'ready-to-dispatch',
    dispatched: 'dispatched',
    in_transit: 'dispatched',
    out_for_delivery: 'dispatched',
    delivered: 'dispatched',
    returned: 'dispatched',
  }
  return tabs[order.status] ?? null
}
 
/** The row shown in admin order lists (and in a customer's recent orders). */
export const toOrderListItem = (order) => ({
  orderNumber: order.orderNumber,
  placedAt: order.placedAt,
  customerCode: order.customerCode,
  customerName: order.customerName,
  customerMobile: order.customerMobile,
  units: order.summary.units,
  grossAmount: order.summary.grossAmount,
  walletApplied: order.summary.walletApplied,
  payable: order.summary.payable,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  status: order.status,
  delayed: Boolean(order.delay),
  onHold: order.onHold,
})
 
const SORT = {
  placedAt: (order) => new Date(order.placedAt).getTime(),
  grossAmount: (order) => order.grossAmount,
}
 
function buildList(query) {
  const range = resolveRange(query, 'all')
  const base = db.orders.filter(
    (order) =>
      inRange(order.placedAt, range) &&
      (!query.payment || order.paymentStatus === query.payment) &&
      matchesText(query.q, order.orderNumber, order.customerName, order.customerCode, order.customerMobile),
  )
  const counts = { all: base.length }
  base.forEach((order) => {
    counts[order.status] = (counts[order.status] ?? 0) + 1
  })
  const rows = base.filter((order) => !query.status || order.status === query.status).map(toOrderListItem)
  return listResponse(sortBy(rows, query.sort || '-placedAt', SORT), query, { counts })
}
 
/** Orders cancelled before a refund was recorded still show one: the paid amount back to the payment method. */
function refundOf(order) {
  if (order.refund) return order.refund
  if (order.status !== 'cancelled' || order.paymentStatus !== 'refunded') return null
  return { amount: order.summary.payable, to: 'original payment method', at: order.timestamps.cancelledAt ?? order.placedAt, reason: null, walletAmount: order.summary.walletApplied }
}
 
function buildDetail(orderNumber) {
  const order = getOrder(orderNumber)
  if (!order) throw new MockHttpError(404, 'Order not found.')
  return {
    ...withLineImages(order),
    timeline: buildCustomerTimeline(order),
    refund: refundOf(order),
    canCancel: CANCELLABLE.includes(order.status),
    fulfilmentTab: fulfilmentTab(order),
  }
}
 
function cancelOrder(orderNumber, body) {
  const order = getOrder(orderNumber)
  if (!order) throw new MockHttpError(404, 'Order not found.')
  if (!CANCELLABLE.includes(order.status)) {
    throw new MockHttpError(409, 'Only new or to-pick orders can be cancelled. Later orders are handled in Store Operation.')
  }
  if (!CANCEL_REASONS.includes(body?.reason)) throw new MockHttpError(422, 'Choose a reason for the cancellation.')
 
  const at = nowIso()
  const paid = order.paymentStatus === 'paid'
  order.status = 'cancelled'
  order.onHold = false
  order.delay = null
  order.timestamps.cancelledAt = at
  if (paid) {
    order.paymentStatus = 'refunded'
    order.refund = { amount: order.summary.payable, to: 'original payment method', at, reason: body.reason, walletAmount: order.summary.walletApplied }
    // The part paid from the wallet goes back to the wallet; the rest returns through Razorpay.
    const customer = getCustomer(order.customerId)
    if (customer && order.summary.walletApplied > 0) {
      customer.walletBalance += order.summary.walletApplied
      db.walletTransactions.push({
        id: `wtx_${order.orderNumber}_refund`,
        customerId: customer.id,
        type: 'credit',
        amount: order.summary.walletApplied,
        reason: `Refund · order ${order.orderNumber}`,
        reference: order.orderNumber,
        at,
      })
    }
  }
  return buildDetail(orderNumber)
}
 
export const orderHandlers = [
  defineHandler('get', '/admin/orders', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildList(query) }
  }),
 
  defineHandler('get', '/admin/orders/:orderNumber', ({ params, headers }) => {
    requireAdmin(headers)
    return { data: buildDetail(params.orderNumber) }
  }),
 
  defineHandler('post', '/admin/orders/:orderNumber/cancel', ({ params, body, headers }) => {
    requireAdmin(headers)
    return { data: cancelOrder(params.orderNumber, body) }
  }),
]
