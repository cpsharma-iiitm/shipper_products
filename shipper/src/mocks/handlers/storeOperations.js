// DEV FIXTURES — warehouse fulfilment (Store Operation) and shipping for the mock API. Every handler is
// admin-only and mutates the in-memory `db.orders`, which resets on reload. Nothing here talks to
// India Post, a warehouse system or an inventory service; carrier tracking events are simulated.
// ASSUMPTION — confirm with backend team: every path, payload and response shape in this file.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getOrder, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import {
  addDays,
  DEFAULT_DIMENSIONS_CM,
  DEFAULT_PACKAGING,
  DISPATCH_WINDOW_DAYS,
  filterStage,
  getTrackingSyncedAt,
  istDate,
  markTrackingSynced,
  nextSequence,
  ordersInStage,
  packageOf,
  shortagesOf,
  STAGE_LABELS,
  STAGE_MATCHERS,
  stageCounts,
  stageSummary,
  TEAM,
  TODAY,
  toQueueRow,
  toWorkOrder,
} from '@/mocks/lib/fulfilment'
import { requireAdmin } from '@/mocks/lib/auth'
import { paginate, sortBy } from '@/mocks/lib/paginate'

const STORE = '/admin/store-operations'
const CONSIGNMENT_ID = /^[A-Z]{2}\d{9}IN$/
const PACKAGING_TYPES = ['Corrugated box · S', 'Corrugated box · M', 'Corrugated box · L', 'Poly mailer']
const SERVICES = ['Speed Post', 'Registered Parcel', 'Business Parcel']
const HOLDABLE_STAGES = ['new', 'to_pick', 'to_pack', 'ready']

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const ok = (data) => ({ data })

function loadOrder(orderNumber, stage) {
  const order = getOrder(orderNumber)
  if (!order) throw new MockHttpError(404, 'Order not found.')
  if (stage && !STAGE_MATCHERS[stage](order)) {
    throw new MockHttpError(409, `${order.orderNumber} is no longer in ${STAGE_LABELS[stage]}. Refresh the queue and try again.`)
  }
  return order
}

function assertNotOnHold(order) {
  if (order.onHold) throw new MockHttpError(409, `${order.orderNumber} is on hold. Resolve the exception first.`)
}

// ── Transitions ─────────────────────────────────────────────────────────────────────────────────
function verifyOrder(order) {
  if (order.status !== 'new') throw new MockHttpError(409, `${order.orderNumber} is no longer in New orders. Refresh the queue and try again.`)
  assertNotOnHold(order)
  if (order.paymentStatus !== 'paid') {
    throw new MockHttpError(409, `Payment for ${order.orderNumber} is ${order.paymentStatus}. Verify the order once the payment is confirmed.`)
  }
  order.status = 'to_pick'
  order.timestamps.verifiedAt = FIXTURE_NOW
  order.fulfilment.pickBatch ??= 'PICK-2810-04'
}

function pickOrder(order, lines) {
  assertNotOnHold(order)
  const picked = new Map((lines ?? []).map((line) => [line.productCode, Number(line.pickedQuantity)]))
  order.lines.forEach((line) => {
    if (picked.get(line.productCode) !== line.quantity) throw new MockHttpError(409, `The pick list is incomplete: ${line.productCode} is not fully picked.`)
    if ((getProduct(line.productCode)?.stock ?? 0) < line.quantity) {
      throw new MockHttpError(409, `Stock is short for ${line.productCode}. Report the discrepancy instead.`)
    }
  })
  order.status = 'to_pack'
  order.timestamps.pickedAt = FIXTURE_NOW
}

function packOrder(order, body, adminName) {
  assertNotOnHold(order)
  const weightKg = Number(body.weightKg)
  if (!(weightKg > 0)) throw new MockHttpError(422, 'Enter the parcel weight.', { message: 'Enter the parcel weight.', errors: { weightKg: 'Enter the parcel weight.' } })
  const dimensionsCm = { ...DEFAULT_DIMENSIONS_CM, ...Object.fromEntries(Object.entries(body.dimensionsCm ?? {}).map(([key, value]) => [key, Number(value)])) }
  order.status = 'packed'
  order.timestamps.packedAt = FIXTURE_NOW
  order.invoiceNumber ??= `INV-26-${order.orderNumber.slice(2)}`
  order.fulfilment.packedBy = body.packedBy || adminName
  order.fulfilment.packaging = body.packaging || DEFAULT_PACKAGING
  order.fulfilment.package = { weightKg, dimensionsCm }
}

function dispatchOrder(order, entry) {
  if (order.status !== 'packed') throw new MockHttpError(409, `${order.orderNumber} is no longer in Ready to dispatch. Refresh the queue and try again.`)
  const consignmentId = String(entry.consignmentId ?? '').trim().toUpperCase()
  const fieldError = (field, message) => new MockHttpError(422, message, { message, errors: { [field]: message } })
  if (!CONSIGNMENT_ID.test(consignmentId)) throw fieldError('consignmentId', 'Enter a valid ID: 2 letters, 9 digits, IN.')
  const duplicate = db.orders.find((other) => other !== order && other.shipment?.consignmentId === consignmentId)
  if (duplicate) throw fieldError('consignmentId', `This ID is already assigned to ${duplicate.orderNumber}.`)

  const dispatchDate = entry.dispatchDate || TODAY
  if (dispatchDate > TODAY || dispatchDate < istDate(order.timestamps.packedAt)) {
    throw fieldError('dispatchDate', 'Choose a date between the day the order was packed and today.')
  }
  const dispatchedAt = dispatchDate === TODAY ? FIXTURE_NOW : `${dispatchDate}T16:30:00+05:30`
  const parcel = packageOf(order) ?? { weightKg: 1, dimensionsCm: { ...DEFAULT_DIMENSIONS_CM } }

  order.status = 'dispatched'
  order.timestamps.dispatchedAt = dispatchedAt
  order.shipment = {
    carrier: entry.carrier || 'India Post',
    service: entry.service || SERVICES[0],
    consignmentId,
    dispatchedAt,
    expectedDelivery: `${addDays(dispatchDate, 4)}T18:00:00+05:30`,
    deliveredAt: null,
    weightKg: parcel.weightKg,
    dimensionsCm: parcel.dimensionsCm,
    status: 'dispatched',
    lastUpdate: null,
  }
  order.fulfilment.moveSeq = nextSequence()
  // Handing the parcel to India Post settles a missed pickup.
  if (order.delay?.issue === 'pickup_missed') {
    order.delay = null
    order.onHold = false
  }
}

function raiseDelay(order, delay) {
  order.onHold = true
  order.delay = { ageHours: 0, note: '', ...delay }
  order.fulfilment.moveSeq = nextSequence()
}

/** Runs `action` for each order number and reports which ones moved and which were refused. */
function runBulk(orderNumbers, action) {
  const succeeded = []
  const failed = []
  ;(orderNumbers ?? []).forEach((orderNumber) => {
    try {
      action(loadOrder(orderNumber))
      succeeded.push(orderNumber)
    } catch (error) {
      if (!(error instanceof MockHttpError)) throw error
      failed.push({ orderNumber, reason: error.message })
    }
  })
  return { succeeded, failed }
}

// ── Documents and exports ───────────────────────────────────────────────────────────────────────
function pickListDocument(orders) {
  const rows = orders
    .flatMap((order) => order.lines.map((line) => ({ order, line })))
    .sort((a, b) => a.line.bin.localeCompare(b.line.bin) || a.order.orderNumber.localeCompare(b.order.orderNumber))
    .map(
      ({ order, line }) =>
        `<tr><td>${escapeHtml(line.bin)}</td><td>${escapeHtml(line.productCode)}</td><td>${escapeHtml(line.name)}</td><td>${line.quantity}</td><td>${escapeHtml(order.orderNumber)}</td></tr>`,
    )
    .join('')
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pick list</title><style>body{font:14px/1.5 Inter,system-ui,sans-serif;color:#172b44;margin:32px auto;max-width:760px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px;border-bottom:1px solid #e3e9f1;text-align:left}.note{margin-top:24px;padding:8px 12px;background:#fff5df;color:#9b620b;border-radius:6px;font-size:12px}</style></head><body>
<h1>Pick list · ${orders.length} orders</h1><p>Sorted by bin location.</p>
<table><thead><tr><th>Bin</th><th>SKU</th><th>Product</th><th>Qty</th><th>Order</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">DEV FIXTURE — a simulated document from the mock API, not a warehouse system print-out.</p></body></html>`
  return new Blob([html], { type: 'text/html' })
}

// ── Handlers ────────────────────────────────────────────────────────────────────────────────────
export const storeOperationHandlers = [
  defineHandler('get', `${STORE}/options`, ({ headers }) => {
    requireAdmin(headers)
    return ok({
      today: TODAY,
      asOfDates: [TODAY, addDays(TODAY, -1), addDays(TODAY, -2)],
      owners: TEAM,
      packers: TEAM,
      assignees: TEAM,
      warehouses: ['Lucknow'],
      packagingTypes: PACKAGING_TYPES,
      carriers: [{ value: 'India Post', label: 'India Post', services: SERVICES }],
    })
  }),

  defineHandler('get', `${STORE}/counts`, ({ headers }) => {
    requireAdmin(headers)
    return ok(stageCounts())
  }),

  defineHandler('get', `${STORE}/queue`, ({ query, headers }) => {
    requireAdmin(headers)
    if (!STAGE_MATCHERS[query.stage]) throw new MockHttpError(400, 'Unknown stage.')
    const page = paginate(filterStage(query.stage, query).map(toQueueRow), { page: query.page, pageSize: query.pageSize })
    return ok({ ...page, summary: stageSummary(query.stage) })
  }),

  defineHandler('get', `${STORE}/export`, ({ query, headers }) => {
    requireAdmin(headers)
    if (!STAGE_MATCHERS[query.stage]) throw new MockHttpError(400, 'Unknown stage.')
    return ok({ items: filterStage(query.stage, query).map(toQueueRow) })
  }),

  defineHandler('get', `${STORE}/pick-list`, ({ query, headers }) => {
    requireAdmin(headers)
    return { data: pickListDocument(filterStage('to_pick', query)) }
  }),

  defineHandler('get', `${STORE}/orders/:orderNumber`, ({ params, headers }) => {
    requireAdmin(headers)
    return ok(toWorkOrder(loadOrder(params.orderNumber)))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/verify`, ({ params, headers }) => {
    requireAdmin(headers)
    const order = loadOrder(params.orderNumber)
    verifyOrder(order)
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/verify`, ({ body, headers }) => {
    requireAdmin(headers)
    return ok(runBulk(body?.orderNumbers, verifyOrder))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/hold`, ({ params, headers }) => {
    const admin = requireAdmin(headers)
    const order = loadOrder(params.orderNumber)
    if (!HOLDABLE_STAGES.some((stage) => STAGE_MATCHERS[stage](order))) throw new MockHttpError(409, `${order.orderNumber} can no longer be put on hold.`)
    if (order.onHold) throw new MockHttpError(409, `${order.orderNumber} is already on hold.`)
    if (order.delay) {
      order.onHold = true
    } else {
      raiseDelay(order, {
        issue: 'manual_hold',
        label: 'On hold',
        detail: `Held by ${admin.name} before release.`,
        owner: admin.name,
        priority: 'medium',
        action: 'notify_customer',
        expectedResolutionAt: `${addDays(TODAY, 1)}T12:00:00+05:30`,
      })
    }
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/stock-exception`, ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const order = loadOrder(params.orderNumber, 'to_pick')
    const line = order.lines.find((candidate) => candidate.productCode === body?.productCode)
    const available = Number(body?.availableQuantity)
    if (!line) throw new MockHttpError(422, 'Choose a product from this pick list.')
    if (!Number.isInteger(available) || available < 0 || available >= line.quantity) {
      const message = `Enter the quantity found in the bin, fewer than the ${line.quantity} requested.`
      throw new MockHttpError(422, message, { message, errors: { availableQuantity: message } })
    }
    // The bin count replaces the system stock figure.
    getProduct(line.productCode).stock = available
    raiseDelay(order, {
      issue: 'stock_shortage',
      label: `Stock: ${line.productCode} −${line.quantity - available}`,
      detail: `${line.productCode} ${line.name}: requested ${line.quantity}, available ${available}. Shortage: ${line.quantity - available} units.`,
      owner: admin.name,
      priority: 'high',
      action: 'wait_for_restock',
      expectedResolutionAt: `${addDays(TODAY, 1)}T12:00:00+05:30`,
      note: body?.note ?? '',
    })
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/picked`, ({ params, body, headers }) => {
    requireAdmin(headers)
    const order = loadOrder(params.orderNumber, 'to_pick')
    pickOrder(order, body?.lines)
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/packed`, ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const order = loadOrder(params.orderNumber, 'to_pack')
    packOrder(order, body ?? {}, admin.name)
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/dispatch`, ({ params, body, headers }) => {
    requireAdmin(headers)
    const order = loadOrder(params.orderNumber)
    dispatchOrder(order, body ?? {})
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/dispatch`, ({ body, headers }) => {
    requireAdmin(headers)
    const entries = new Map((body?.entries ?? []).map((entry) => [entry.orderNumber, entry]))
    return ok(runBulk([...entries.keys()], (order) => dispatchOrder(order, entries.get(order.orderNumber))))
  }),

  defineHandler('put', `${STORE}/orders/:orderNumber/resolution`, ({ params, body, headers }) => {
    requireAdmin(headers)
    const order = loadOrder(params.orderNumber, 'delayed')
    order.delay = {
      ...order.delay,
      owner: body?.owner ?? order.delay.owner,
      action: body?.action ?? order.delay.action,
      expectedResolutionAt: body?.expectedResolutionAt ?? order.delay.expectedResolutionAt,
      note: body?.note ?? order.delay.note,
      ...(body?.notifyCustomer ? { lastNotifiedAt: FIXTURE_NOW } : {}),
    }
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/orders/:orderNumber/resolve`, ({ params, headers }) => {
    requireAdmin(headers)
    const order = loadOrder(params.orderNumber, 'delayed')
    if (order.delay.issue === 'stock_shortage') {
      // The restock the shortage was waiting for is assumed to have arrived.
      shortagesOf(order).forEach((shortage) => {
        getProduct(shortage.productCode).stock = shortage.requested
      })
    }
    order.delay = null
    order.onHold = false
    return ok(toWorkOrder(order))
  }),

  defineHandler('post', `${STORE}/assign-owner`, ({ body, headers }) => {
    requireAdmin(headers)
    if (!TEAM.includes(body?.owner)) throw new MockHttpError(422, 'Choose a team member.')
    return ok(
      runBulk(body.orderNumbers, (order) => {
        if (!order.delay) throw new MockHttpError(409, `${order.orderNumber} has no open exception.`)
        order.delay = { ...order.delay, owner: body.owner }
      }),
    )
  }),

  defineHandler('post', `${STORE}/notify-customers`, ({ body, headers }) => {
    requireAdmin(headers)
    return ok(
      runBulk(body?.orderNumbers, (order) => {
        if (!order.delay) throw new MockHttpError(409, `${order.orderNumber} has no open exception.`)
        order.delay = { ...order.delay, lastNotifiedAt: FIXTURE_NOW }
      }),
    )
  }),

  // DEV FIXTURES — India Post tracking sync is not integrated; this only moves the "synced" clock.
  defineHandler('post', `${STORE}/tracking/refresh`, ({ headers }) => {
    requireAdmin(headers)
    return ok({ syncedAt: markTrackingSynced() })
  }),

  defineHandler('get', '/admin/shipments', ({ query, headers }) => {
    requireAdmin(headers)
    const windowed = ordersInStage('dispatched')
    const byStatus = { dispatched: 0, in_transit: 0, out_for_delivery: 0, delivered: 0, returned: 0 }
    windowed.forEach((order) => {
      byStatus[order.shipment.status] = (byStatus[order.shipment.status] ?? 0) + 1
    })
    const search = String(query.search ?? '').trim().toLowerCase()
    const matching = windowed
      .filter((order) => !query.status || query.status === 'all' || order.shipment.status === query.status)
      .map(toQueueRow)
      .filter((row) =>
        [row.orderNumber, row.customerName, row.city, row.shipment.consignmentId].some((field) => String(field).toLowerCase().includes(search)),
      )
    const sorted = sortBy(matching, '-dispatchedAt', { dispatchedAt: (row) => Date.parse(row.shipment.dispatchedAt) })
    return ok({
      ...paginate(sorted, { page: query.page, pageSize: query.pageSize }),
      summary: { total: windowed.length, byStatus, windowDays: DISPATCH_WINDOW_DAYS, carrier: 'India Post', syncedAt: getTrackingSyncedAt() },
    })
  }),
]

