// DEV FIXTURES — a customer's order history, order detail and the public shipment lookup for the mock API.
// ASSUMPTION — confirm with backend team: paths, query parameters and payloads (see features/orders and
// features/tracking services). Customers only ever receive their own orders, and only the fields below:
// internal fulfilment data (bins, batches, PV, assignees, delays) never leaves the backend.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getOrder, getProduct, ordersOfCustomer, withLineImages } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { requireUser } from '@/mocks/lib/auth'
import { matchesText, paginate } from '@/mocks/lib/paginate'
import { buildCustomerTimeline } from '@/mocks/lib/timeline'

// DEV FIXTURE: the carrier's public tracking page. The real backend supplies the link per shipment.
const INDIA_POST_TRACKING_URL = 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx'

// DEV FIXTURE: compact labels the order list uses ("Haldi ×2, Shampoo ×1"). Products without one use their name.
const SHORT_NAMES = { HL001: 'Haldi', SH002: 'Shampoo', PC003: 'Aloe Face Wash', CO004: 'Rose Lip Tint' }

// The "Status" filter on My orders groups the fulfilment statuses the way a customer thinks about them.
const STATUS_GROUPS = {
  processing: ['new', 'to_pick', 'to_pack', 'packed'],
  shipped: ['dispatched', 'in_transit', 'out_for_delivery'],
  delivered: ['delivered'],
  returned: ['returned'],
  cancelled: ['cancelled'],
}
const OPEN_STATUSES = [...STATUS_GROUPS.processing, ...STATUS_GROUPS.shipped]
const PERIOD_MONTHS = { '1m': 1, '3m': 3, '6m': 6 }
const TRACK_NOT_FOUND = "We couldn't find a shipment for those details. Check the order number, mobile number or consignment ID and try again."

const normalizeMobile = (value = '') => String(value).replace(/[\s-]/g, '').replace(/^\+?91(?=\d{10}$)/, '')
const periodStart = (period) => {
  const months = PERIOD_MONTHS[period]
  if (!months) return null
  const start = new Date(FIXTURE_NOW)
  start.setMonth(start.getMonth() - months)
  return start
}

/** The backend's promise for open orders without a carrier date yet: five days after the order was placed. */
function estimatedDeliveryOf(order) {
  if (order.shipment?.expectedDelivery) return order.shipment.expectedDelivery
  return OPEN_STATUSES.includes(order.status) ? new Date(Date.parse(order.placedAt) + 5 * 24 * 3_600_000).toISOString() : null
}

const isAvailable = (productCode) => {
  const product = getProduct(productCode)
  return Boolean(product && product.status === 'active' && product.stock > 0)
}
const canReorder = (order) => order.lines.some((line) => isAvailable(line.productCode))

const toShipment = (order) =>
  order.shipment
    ? {
        carrier: order.shipment.carrier,
        service: order.shipment.service,
        consignmentId: order.shipment.consignmentId,
        trackingUrl: INDIA_POST_TRACKING_URL,
        lastUpdate: order.shipment.lastUpdate,
      }
    : null

function toSummary(order) {
  return {
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    grossAmount: order.summary.grossAmount,
    units: order.summary.units,
    items: withLineImages(order).lines.map((line) => ({
      productCode: line.productCode,
      name: line.name,
      shortName: SHORT_NAMES[line.productCode] ?? line.name,
      quantity: line.quantity,
      image: line.image,
    })),
    estimatedDelivery: estimatedDeliveryOf(order),
    carrier: order.shipment?.carrier ?? null,
    deliveredAt: order.timestamps.deliveredAt ?? null,
    refund: order.refund,
    hasInvoice: Boolean(order.invoiceNumber),
    canReorder: canReorder(order),
  }
}

function toDetail(order) {
  const savedAddresses = db.addresses[order.customerId] ?? []
  const isDefault = savedAddresses.some((saved) => saved.isDefault && saved.line1 === order.address.line1 && saved.pin === order.address.pin)
  return {
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    razorpayPaymentId: order.razorpayPaymentId,
    invoiceNumber: order.invoiceNumber,
    estimatedDelivery: estimatedDeliveryOf(order),
    deliveredAt: order.timestamps.deliveredAt ?? null,
    lines: withLineImages(order).lines.map((line) => ({
      productCode: line.productCode,
      slug: line.slug,
      name: line.name,
      unit: line.unit,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
      image: line.image,
      available: isAvailable(line.productCode),
    })),
    summary: order.summary,
    address: { ...order.address, isDefault },
    deliveryInstructions: order.deliveryInstructions,
    shipment: toShipment(order),
    timeline: buildCustomerTimeline(order),
    refund: order.refund,
    canReorder: canReorder(order),
  }
}

export const orderHandlers = [
  // Query: page, pageSize, status (a key of STATUS_GROUPS), period ('1m' | '3m' | '6m' | 'all'), q.
  defineHandler('get', '/orders', ({ query, headers }) => {
    const user = requireUser(headers)
    const since = periodStart(query.period)
    const status = STATUS_GROUPS[query.status]
    const needle = String(query.q ?? '').replace(/^#/, '')

    const matching = ordersOfCustomer(user.id)
      .filter((order) => !since || Date.parse(order.placedAt) >= since.getTime())
      .filter((order) => !status || status.includes(order.status))
      .filter((order) => matchesText(needle, order.orderNumber, ...order.lines.flatMap((line) => [line.name, line.productCode])))
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))

    const { items, ...paging } = paginate(matching, { page: query.page, pageSize: query.pageSize ?? 4 })
    return { data: { items: items.map(toSummary), ...paging } }
  }),

  // Public, so the visitor has no session: the order number must come with the mobile number on the
  // order, or the consignment ID must match. Only shipment progress is returned, never names or addresses.
  // ASSUMPTION — confirm with backend team: rate limiting / bot protection on this endpoint.
  defineHandler('post', '/orders/track', ({ body }) => {
    const consignmentId = String(body?.consignmentId ?? '').trim().toUpperCase()
    const orderNumber = String(body?.orderNumber ?? '').trim().toUpperCase().replace(/^#/, '')
    const mobile = normalizeMobile(body?.mobile)

    const order = consignmentId
      ? db.orders.find((candidate) => candidate.shipment?.consignmentId === consignmentId)
      : getOrder(orderNumber)
    const mobileMatches = Boolean(order && mobile && [order.customerMobile, order.address.mobile].map(normalizeMobile).includes(mobile))
    if (!order || (!consignmentId && !mobileMatches)) throw new MockHttpError(404, TRACK_NOT_FOUND)

    return {
      data: {
        orderNumber: order.orderNumber,
        placedAt: order.placedAt,
        status: order.status,
        units: order.summary.units,
        estimatedDelivery: estimatedDeliveryOf(order),
        deliveredAt: order.timestamps.deliveredAt ?? null,
        shipment: toShipment(order),
        timeline: buildCustomerTimeline(order),
      },
    }
  }),

  defineHandler('get', '/orders/:orderNumber', ({ params, headers }) => {
    const user = requireUser(headers)
    const order = getOrder(params.orderNumber.toUpperCase())
    if (!order || order.customerId !== user.id) throw new MockHttpError(404, 'Order not found.')
    return { data: toDetail(order) }
  }),
]
