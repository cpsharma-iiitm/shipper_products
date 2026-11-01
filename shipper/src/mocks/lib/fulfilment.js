// DEV FIXTURES — the warehouse fulfilment rules of the *fake* backend: which orders sit in which
// stage, how queues are ordered, and the work-order view the Store Operation panels read.
// The frontend only renders what it is given.
// ASSUMPTION — confirm with backend team: stage names, queue ordering, group names and every shape below.
import { db, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { buildCustomerTimeline } from '@/mocks/lib/timeline'
import { ORIGIN_STATE_CODE, round2 } from '@/mocks/lib/quote'

export const DISPATCH_WINDOW_DAYS = 14
/** Delayed orders older than this are "beyond SLA". */
export const SLA_HOURS = 48
export const SELLER_GSTIN = '09AAXCS1048K1Z6'
export const DEFAULT_DIMENSIONS_CM = { length: 24, width: 18, height: 12 }
export const DEFAULT_PACKAGING = 'Corrugated box · M'
export const DEFAULT_PACKER = 'Anjali Singh'
export const TEAM = ['Pawan Yadav', 'Aman Singh', 'Neha Joshi', 'Suresh Kumar', 'Anjali Singh']

const IST_OFFSET_MS = 5.5 * 3_600_000
const DAY_MS = 86_400_000
const SHIPPED_STATUSES = ['dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'returned']

/** The calendar day (YYYY-MM-DD) of an instant in India. */
export const istDate = (iso) => new Date(Date.parse(iso) + IST_OFFSET_MS).toISOString().slice(0, 10)
export const TODAY = istDate(FIXTURE_NOW)
export const addDays = (isoDate, days) => new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
export const plusHours = (iso, hours) => new Date(Date.parse(iso) + hours * 3_600_000).toISOString()

export const STAGE_LABELS = { new: 'New orders', to_pick: 'To pick', to_pack: 'To pack', ready: 'Ready to dispatch', dispatched: 'Dispatched', delayed: 'Delayed orders' }

function dispatchedRecently(order) {
  const at = order.timestamps.dispatchedAt
  if (!at || !order.shipment || !SHIPPED_STATUSES.includes(order.status)) return false
  const age = Date.parse(FIXTURE_NOW) - Date.parse(at)
  return age >= 0 && age <= DISPATCH_WINDOW_DAYS * DAY_MS
}

export const STAGE_MATCHERS = {
  new: (order) => order.status === 'new',
  to_pick: (order) => order.status === 'to_pick',
  to_pack: (order) => order.status === 'to_pack',
  ready: (order) => order.status === 'packed',
  dispatched: dispatchedRecently,
  delayed: (order) => Boolean(order.delay),
}

// Moves of an order made through the API are numbered so they can be listed ahead of (dispatched) or
// after (delayed) the seeded rows, which keep their fixture order.
let sequence = 0
export const nextSequence = () => (sequence += 1)

const byQueue = (a, b) =>
  a.fulfilment.queueRank - b.fulfilment.queueRank || Date.parse(a.placedAt) - Date.parse(b.placedAt) || a.orderNumber.localeCompare(b.orderNumber)
const newestMoveFirst = (a, b) => (b.fulfilment.moveSeq ?? 0) - (a.fulfilment.moveSeq ?? 0)
const oldestMoveFirst = (a, b) => (a.fulfilment.moveSeq ?? 0) - (b.fulfilment.moveSeq ?? 0)
const STAGE_ORDER = { dispatched: newestMoveFirst, delayed: oldestMoveFirst }

/** Orders of one stage in queue order (`db.orders` keeps the fixture order for the stable sorts). */
export const ordersInStage = (stage) => db.orders.filter(STAGE_MATCHERS[stage]).sort(STAGE_ORDER[stage] ?? byQueue)

export const stageOf = (order) => ['new', 'to_pick', 'to_pack', 'ready', 'dispatched'].find((stage) => STAGE_MATCHERS[stage](order)) ?? null

const ISSUE_GROUPS = {
  payment_pending: 'payment',
  payment_failed: 'payment',
  stock_shortage: 'stock',
  shipping_delay: 'shipping',
  pickup_missed: 'shipping',
  pin_mismatch: 'address',
}
export const groupOfIssue = (issue) => ISSUE_GROUPS[issue] ?? 'other'

// ── Parcels ─────────────────────────────────────────────────────────────────────────────────────
// The base order fixtures keep a parcel's weight only on shipped orders. The eight seeded packed orders
// get the weights shown on the design (9.15 kg in total), in queue order.
const SEEDED_PARCEL_WEIGHTS = [0.85, 1.2, 1.1, 2.4, 0.6, 0.75, 1.05, 1.2]
ordersInStage('ready').forEach((order, index) => {
  order.fulfilment.package ??= { weightKg: SEEDED_PARCEL_WEIGHTS[index] ?? 1, dimensionsCm: { ...DEFAULT_DIMENSIONS_CM } }
})

export const packageOf = (order) =>
  order.fulfilment.package ?? (order.shipment ? { weightKg: order.shipment.weightKg, dimensionsCm: order.shipment.dimensionsCm } : null)

const unitsWeightKg = (order) => round2(order.lines.reduce((total, line) => total + (getProduct(line.productCode)?.weightKg ?? 0) * line.quantity, 0))

// ── Stock ───────────────────────────────────────────────────────────────────────────────────────
export const availableStock = (line) => getProduct(line.productCode)?.stock ?? 0
export const shortagesOf = (order) =>
  order.lines
    .filter((line) => availableStock(line) < line.quantity)
    .map((line) => ({ productCode: line.productCode, name: line.name, requested: line.quantity, available: availableStock(line), shortage: line.quantity - availableStock(line) }))

// ── Views ───────────────────────────────────────────────────────────────────────────────────────
const shipmentView = (order) =>
  order.shipment && {
    ...order.shipment,
    // ASSUMPTION — confirm with backend team: the API supplies the carrier's public tracking page.
    trackingUrl: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
  }

/** One row of a queue table. All stages share the shape; each table reads the columns it needs. */
export function toQueueRow(order) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    city: order.address.city,
    state: order.address.state,
    pin: order.address.pin,
    placedAt: order.placedAt,
    units: order.summary.units,
    grossAmount: order.summary.grossAmount,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    status: order.status,
    onHold: order.onHold,
    priority: order.fulfilment.priority,
    assignee: order.fulfilment.assignee,
    pickBatch: order.fulfilment.pickBatch,
    hasShortage: order.status === 'to_pick' && shortagesOf(order).length > 0,
    invoiceNumber: order.invoiceNumber,
    weightKg: packageOf(order)?.weightKg ?? null,
    shipment: shipmentView(order),
    delay: order.delay && {
      issue: order.delay.issue,
      group: groupOfIssue(order.delay.issue),
      label: order.delay.label,
      ageHours: order.delay.ageHours,
      owner: order.delay.owner,
      priority: order.delay.priority,
    },
  }
}

/** Everything the right-hand panels need about one order. */
export function toWorkOrder(order) {
  const { summary } = order
  const shortages = shortagesOf(order)
  const recorded = order.fulfilment.package ?? null
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    stage: stageOf(order),
    onHold: order.onHold,
    placedAt: order.placedAt,
    customer: { name: order.customerName, code: order.customerCode, mobile: order.customerMobile, email: order.customerEmail },
    address: order.address,
    deliveryInstructions: order.deliveryInstructions,
    payment: {
      status: order.paymentStatus,
      method: order.paymentMethod,
      razorpayPaymentId: order.razorpayPaymentId,
      gross: summary.grossAmount,
      walletApplied: summary.walletApplied,
      paid: summary.payable,
    },
    summary: { units: summary.units, grossAmount: summary.grossAmount, payable: summary.payable, walletApplied: summary.walletApplied },
    lines: order.lines.map((line) => ({
      productCode: line.productCode,
      name: line.name,
      unit: line.unit,
      quantity: line.quantity,
      batch: line.batch,
      bin: line.bin,
      available: availableStock(line),
      // What the packer checks on arrival at the packing bench.
      inspection: getProduct(line.productCode)?.category === 'shampoo' ? 'No leakage' : 'Seal intact',
    })),
    stock: { warehouse: order.fulfilment.warehouse, allAvailable: shortages.length === 0, shortages },
    fulfilment: {
      warehouse: order.fulfilment.warehouse,
      assignee: order.fulfilment.assignee,
      pickBatch: order.fulfilment.pickBatch,
      priority: order.fulfilment.priority,
      packedBy: order.fulfilment.packedBy,
      packaging: order.fulfilment.packaging,
    },
    timestamps: order.timestamps,
    pack: {
      suggested: { weightKg: unitsWeightKg(order), dimensionsCm: { ...DEFAULT_DIMENSIONS_CM }, packaging: DEFAULT_PACKAGING, packedBy: DEFAULT_PACKER },
      recorded: recorded && { ...recorded, packaging: order.fulfilment.packaging, packedBy: order.fulfilment.packedBy },
    },
    invoice: {
      number: order.invoiceNumber ?? `INV-26-${order.orderNumber.slice(2)}`,
      date: order.placedAt,
      taxable: order.summary.taxableSubtotal,
      gst: order.summary.gstTotal,
      gross: summary.grossAmount,
      gstin: SELLER_GSTIN,
      stateCode: ORIGIN_STATE_CODE,
    },
    dispatch: { suggestedDate: TODAY },
    shipment: shipmentView(order),
    tracking: order.shipment ? buildCustomerTimeline(order) : [],
    delay: order.delay && { ...order.delay, group: groupOfIssue(order.delay.issue) },
  }
}

// ── Filtering ───────────────────────────────────────────────────────────────────────────────────
const includesText = (needle, ...fields) => {
  const text = String(needle ?? '').trim().toLowerCase()
  return text === '' || fields.some((field) => String(field ?? '').toLowerCase().includes(text))
}
const isSet = (value) => value && value !== 'all'

const STAGE_FILTERS = {
  new: (order, q) =>
    includesText(q.search, order.orderNumber, order.customerName, order.address.pin) &&
    (!isSet(q.payment) || order.paymentStatus === q.payment) &&
    (!q.asOf || istDate(order.placedAt) <= q.asOf),
  to_pick: (order, q) =>
    includesText(q.search, order.orderNumber, order.customerName, ...order.lines.flatMap((line) => [line.productCode, line.bin, line.name])) &&
    (!isSet(q.warehouse) || order.fulfilment.warehouse.toLowerCase().includes(q.warehouse)) &&
    (!isSet(q.assignee) || order.fulfilment.assignee === q.assignee),
  to_pack: (order, q) => includesText(q.search, order.orderNumber, order.customerName, order.invoiceNumber),
  ready: (order, q) =>
    includesText(q.search, order.orderNumber, order.customerName, order.invoiceNumber) &&
    (!q.asOf || istDate(order.timestamps.packedAt) <= q.asOf),
  dispatched: (order, q) =>
    includesText(q.search, order.orderNumber, order.customerName, order.shipment?.consignmentId) &&
    (!isSet(q.status) || order.shipment?.status === q.status),
  delayed: (order, q) =>
    includesText(q.search, order.orderNumber, order.customerName, order.delay.label, order.delay.detail) &&
    (!isSet(q.issue) || groupOfIssue(order.delay.issue) === q.issue) &&
    (!isSet(q.age) || order.delay.ageHours >= Number(q.age)) &&
    (!isSet(q.owner) || order.delay.owner === q.owner),
}

export const filterStage = (stage, query) => ordersInStage(stage).filter((order) => STAGE_FILTERS[stage](order, query))

// ── Summaries ───────────────────────────────────────────────────────────────────────────────────
export function stageCounts() {
  const counts = Object.fromEntries(Object.keys(STAGE_MATCHERS).map((stage) => [stage, db.orders.filter(STAGE_MATCHERS[stage]).length]))
  const beyondSla = db.orders.filter((order) => order.delay && order.delay.ageHours >= SLA_HOURS).length
  return { ...counts, delayedBeyondSla: beyondSla, slaHours: SLA_HOURS }
}

let trackingSyncedAt = '2026-10-28T10:30:00+05:30'
export const getTrackingSyncedAt = () => trackingSyncedAt
export const markTrackingSynced = () => (trackingSyncedAt = FIXTURE_NOW)

export function stageSummary(stage) {
  if (stage === 'to_pick') {
    const orders = ordersInStage('to_pick')
    const needsAttention = orders.filter((order) => order.onHold || shortagesOf(order).length > 0).length
    return {
      ordersToPick: orders.length,
      unitsRequested: orders.reduce((total, order) => total + order.summary.units, 0),
      stockChecksPassed: orders.length - needsAttention,
      needsAttention,
      stockExceptions: orders
        .filter((order) => order.delay?.issue === 'stock_shortage')
        .map((order) => ({ orderNumber: order.orderNumber, onHold: order.onHold, detail: order.delay.detail })),
    }
  }
  if (stage === 'ready') {
    const orders = ordersInStage('ready')
    return {
      nextPickup: {
        at: '2026-10-28T16:30:00+05:30',
        parcels: orders.length,
        weightKg: round2(orders.reduce((total, order) => total + (packageOf(order)?.weightKg ?? 0), 0)),
      },
    }
  }
  if (stage === 'dispatched') return { trackingSyncedAt }
  if (stage === 'delayed') {
    const orders = ordersInStage('delayed')
    const inGroup = (group) => orders.filter((order) => groupOfIssue(order.delay.issue) === group).length
    return {
      total: orders.length,
      beyondSla: orders.filter((order) => order.delay.ageHours >= SLA_HOURS).length,
      slaHours: SLA_HOURS,
      groups: { payment: inGroup('payment'), stock: inGroup('stock'), shipping: inGroup('shipping'), address: inGroup('address'), other: inGroup('other') },
    }
  }
  return {}
}
