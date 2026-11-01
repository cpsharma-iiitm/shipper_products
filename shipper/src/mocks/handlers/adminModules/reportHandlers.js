// DEV FIXTURES — reports overview and financial report for the mock API.
// ASSUMPTION — confirm with backend team: paths, query parameters and payloads (see endpointGroups/adminModules.js
// and features/reports/services/reportService.js for the contract the screens expect).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getCustomer, getOrder, getProduct } from '@/mocks/db'
import {
  COMPARE_MODES,
  FEATURED_CUSTOMER_IDS,
  FEATURED_PRODUCTS,
  FINANCIAL_DEFAULTS,
  ORDER_STATUS_MIX,
  OVERVIEW_DEFAULTS,
} from '@/mocks/fixtures/reportsData'
import { requireAdmin } from '@/mocks/lib/auth'
import { round2 } from '@/mocks/lib/quote'
import { matchesText, sortBy } from '@/mocks/lib/paginate'
import { addDays, addMonths, daysBetween, eachDay, inRange, listResponse, monthLabel, resolveRange } from './shared'
 
const sum = (values) => values.reduce((total, value) => total + value, 0)
 
// ── Daily sales curve ────────────────────────────────────────────────────────────────────────────────
// A deterministic, gently rising curve with weekly waves. It is calibrated once so the default period adds up
// to the design's ₹4,82,560; every other day keeps the same value whichever range is asked for.
const CURVE_ORIGIN = '2026-09-01'
const noise = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}
const rawDaily = (iso) => {
  const n = daysBetween(CURVE_ORIGIN, iso)
  return Math.max(2500, 6500 + 260 * n + 1500 * Math.sin(n * 0.85) + 700 * noise(n))
}
 
const DEFAULT_RANGE = resolveRange({}, 'this_month')
const DEFAULT_DAYS = eachDay(DEFAULT_RANGE.from, DEFAULT_RANGE.to)
const CURVE_SCALE = OVERVIEW_DEFAULTS.grossSales / sum(DEFAULT_DAYS.map(rawDaily))
const ROUNDING_FIX = OVERVIEW_DEFAULTS.grossSales - sum(DEFAULT_DAYS.map((day) => Math.round(rawDaily(day) * CURVE_SCALE)))
const DEFAULT_ORDER_COUNT = Math.round(OVERVIEW_DEFAULTS.grossSales / OVERVIEW_DEFAULTS.averageOrderValue)
 
const dailyGross = (iso) => Math.round(rawDaily(iso) * CURVE_SCALE) + (iso === DEFAULT_RANGE.to ? ROUNDING_FIX : 0)
 
function comparisonDays(days, mode) {
  if (mode === 'previous_month') return days.map((day) => addMonths(day, -1))
  if (mode === 'last_year') return days.map((day) => addMonths(day, -12))
  return days.map((day) => addDays(day, -days.length))
}
 
/** Largest-remainder split of `total` in the proportions of `weights`, so the parts always add up. */
function allocate(total, weights) {
  const weightSum = sum(weights)
  const exact = weights.map((weight) => (weight * total) / weightSum)
  const parts = exact.map(Math.floor)
  exact
    .map((value, index) => [value - Math.floor(value), index])
    .sort((a, b) => b[0] - a[0])
    .slice(0, total - sum(parts))
    .forEach(([, index]) => (parts[index] += 1))
  return parts
}
 
const seriesLabels = (range, mode) => ({
  current: range.preset === 'this_month' ? 'This month' : 'This period',
  previous: { previous_month: range.preset === 'this_month' ? 'Last month' : 'Previous month', previous_period: 'Previous period', last_year: 'Last year' }[mode],
})
 
function overviewSeries(range, days, mode, grossSales) {
  const labels = seriesLabels(range, mode)
  const series = [{ key: 'current', label: labels.current, total: grossSales, points: days.map((day) => ({ date: day, value: dailyGross(day) })) }]
  if (!mode) return series
 
  const previousDays = comparisonDays(days, mode)
  const raw = previousDays.map(rawDaily)
  const target = grossSales / (1 + COMPARE_MODES[mode].grossGrowth / 100)
  const scale = target / sum(raw)
  const points = previousDays.map((day, index) => ({ date: day, value: Math.round(raw[index] * scale) }))
  series.push({ key: 'previous', label: labels.previous, total: sum(points.map((point) => point.value)), points })
  return series
}
 
// Units sold per product for the default period; products that are not featured get a stable made-up figure.
const unitsFor = (code) => {
  const featured = FEATURED_PRODUCTS.find((entry) => entry.code === code)
  if (featured) return featured.units
  return 30 + ([...code].reduce((total, char) => total + char.charCodeAt(0) * 7, 0) % 220)
}
 
function overviewCustomers(q) {
  if (!q) return FEATURED_CUSTOMER_IDS.map(getCustomer).filter(Boolean)
  return sortBy(db.customers.filter((customer) => matchesText(q, customer.name, customer.code)), '-totalSpend').slice(0, 5)
}
 
function overviewProducts(q, factor) {
  const pool = q
    ? db.products.filter((product) => matchesText(q, product.name, product.code)).slice(0, 5)
    : FEATURED_PRODUCTS.map((entry) => getProduct(entry.code))
  return pool.map((product) => {
    const units = Math.max(1, Math.round(unitsFor(product.code) * factor))
    return { code: product.code, name: product.name, units, grossSales: units * product.sellingPrice, stock: product.stock }
  })
}
 
function buildOverview(query) {
  const range = resolveRange(query, 'this_month')
  const days = eachDay(range.from, range.to)
  if (days.length > 366) throw new MockHttpError(422, 'Choose a range of up to one year.')
  const mode = query.compare === 'none' ? null : (query.compare ?? 'previous_month')
  if (mode && !COMPARE_MODES[mode]) throw new MockHttpError(422, 'Unknown comparison.')
 
  const grossSales = sum(days.map(dailyGross))
  const orders = Math.max(1, Math.round(grossSales / OVERVIEW_DEFAULTS.averageOrderValue))
  const factor = grossSales / OVERVIEW_DEFAULTS.grossSales
  const counts = orders === DEFAULT_ORDER_COUNT ? ORDER_STATUS_MIX.map((entry) => entry.count) : allocate(orders, ORDER_STATUS_MIX.map((entry) => entry.count))
  const percents = orders === DEFAULT_ORDER_COUNT ? ORDER_STATUS_MIX.map((entry) => entry.percent) : allocate(100, counts)
 
  return {
    period: {
      preset: range.preset,
      from: range.from,
      to: range.to,
      label: range.preset === 'this_month' || range.preset === 'last_month' ? monthLabel(range.from) : null,
    },
    compare: mode ? { key: mode, label: COMPARE_MODES[mode].label } : null,
    summary: {
      grossSales: { value: grossSales, changePercent: mode ? COMPARE_MODES[mode].grossGrowth : null },
      gstCollected: { value: round2((grossSales * OVERVIEW_DEFAULTS.gstCollected) / OVERVIEW_DEFAULTS.grossSales) },
      averageOrderValue: { value: round2(grossSales / orders), changePercent: mode ? COMPARE_MODES[mode].averageOrderValueGrowth : null },
      walletLiability: { value: OVERVIEW_DEFAULTS.walletLiability, customersWithBalance: OVERVIEW_DEFAULTS.customersWithBalance },
    },
    sales: { series: overviewSeries(range, days, mode, grossSales) },
    orderStatus: { totalOrders: orders, items: ORDER_STATUS_MIX.map((entry, index) => ({ key: entry.key, label: entry.label, count: counts[index], percent: percents[index] })) },
    customers: overviewCustomers(query.q).map((customer) => ({
      code: customer.code,
      name: customer.name,
      ordersCount: customer.ordersCount,
      totalSpend: customer.totalSpend,
      walletBalance: customer.walletBalance,
    })),
    products: overviewProducts(query.q, factor),
  }
}
 
// ── Financial report ─────────────────────────────────────────────────────────────────────────────────
// One row per order line. Order-level shipping and wallet use are shown on the first line of each order, so an
// order's rows add up to its invoice without rounding drift.
function lineItems() {
  return db.orders.flatMap((order) =>
    order.lines.map((line, index) => {
      const cgst = order.summary.igst > 0 ? 0 : round2(line.gst / 2)
      const shipping = index === 0 ? order.summary.shipping : 0
      const wallet = index === 0 ? order.summary.walletApplied : 0
      return {
        id: `${order.orderNumber}-${line.productCode}`,
        orderNumber: order.orderNumber,
        orderDate: order.placedAt,
        customerCode: order.customerCode,
        customerName: order.customerName,
        productCode: line.productCode,
        productName: line.name,
        hsn: line.hsn,
        gstPercent: line.gstPercent,
        quantity: line.quantity,
        taxable: line.taxable,
        gst: line.gst,
        cgst,
        sgst: order.summary.igst > 0 ? 0 : round2(line.gst - cgst),
        igst: order.summary.igst > 0 ? line.gst : 0,
        shipping,
        wallet,
        lineTotal: line.lineTotal,
        net: round2(line.lineTotal + shipping - wallet),
        status: order.status,
      }
    }),
  )
}
 
const FINANCIAL_SORT = {
  orderDate: (row) => new Date(row.orderDate).getTime(),
  customerName: (row) => row.customerName,
  quantity: (row) => row.quantity,
  taxable: (row) => row.taxable,
  gst: (row) => row.gst,
  lineTotal: (row) => row.lineTotal,
}
 
function financialSummary(rows, unfiltered) {
  if (unfiltered) return FINANCIAL_DEFAULTS
  const taxableValue = round2(sum(rows.map((row) => row.taxable)))
  const gstTotal = round2(sum(rows.map((row) => row.gst)))
  const shippingTotal = round2(sum(rows.map((row) => row.shipping)))
  return {
    orders: new Set(rows.map((row) => row.orderNumber)).size,
    lineItems: rows.length,
    taxableValue,
    gstTotal,
    shippingTotal,
    grossAmount: round2(taxableValue + gstTotal + shippingTotal),
    walletUsed: round2(sum(rows.map((row) => row.wallet))),
  }
}
 
function buildFinancialReport(query) {
  const range = resolveRange(query, 'this_month')
  const rows = lineItems().filter(
    (row) =>
      inRange(row.orderDate, range) &&
      (!query.status || row.status === query.status) &&
      (!query.customer || row.customerCode === query.customer) &&
      matchesText(query.q, row.orderNumber, row.customerName, row.customerCode, row.productCode, row.productName, row.hsn),
  )
  // Only the unfiltered default period reports the design's backend aggregates; any narrower view is
  // summed from its own rows so the cards always describe what the table lists.
  const unfiltered = range.preset === 'this_month' && !query.status && !query.customer && !query.q
  return listResponse(
    sortBy(rows, query.sort || '-orderDate', FINANCIAL_SORT),
    query,
    { period: { preset: range.preset, from: range.from, to: range.to }, summary: financialSummary(rows, unfiltered) },
    4,
  )
}
 
function buildReconciliation(orderNumber) {
  const order = getOrder(orderNumber)
  if (!order) throw new MockHttpError(404, 'Order not found.')
  const s = order.summary
  const customer = getCustomer(order.customerId)
  const closing = customer?.walletBalance ?? 0
  const balanced =
    Math.abs(round2(s.taxableSubtotal + s.gstTotal + s.shipping) - s.grossAmount) < 0.01 &&
    Math.abs(round2(s.grossAmount - s.couponDiscount - s.walletApplied) - s.payable) < 0.01
  return {
    orderNumber: order.orderNumber,
    reconciliation: {
      taxable: s.taxableSubtotal,
      gst: s.gstTotal,
      shipping: s.shipping,
      gross: s.grossAmount,
      wallet: s.walletApplied,
      gateway: s.payable,
      gatewayLabel: 'Razorpay',
      balanced,
    },
    wallet: { customerCode: order.customerCode, opening: round2(closing + s.walletApplied), used: s.walletApplied, closing },
  }
}
 
export const reportHandlers = [
  defineHandler('get', '/admin/reports/overview', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildOverview(query) }
  }),
 
  defineHandler('get', '/admin/reports/financial', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildFinancialReport(query) }
  }),
 
  defineHandler('get', '/admin/reports/financial/orders/:orderNumber', ({ params, headers }) => {
    requireAdmin(headers)
    return { data: buildReconciliation(params.orderNumber) }
  }),
]
