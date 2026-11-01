// DEV FIXTURES — admin dashboard aggregates. Sales figures are static constants (see
// fixtures/dashboardData.js); queue and stock numbers are counted live from the mock db.
// ASSUMPTION — confirm with backend team: GET /admin/dashboard?period=… and its response shape.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getOrder, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import {
  DASHBOARD_PERIODS,
  DEFAULT_DASHBOARD_PERIOD,
  getDashboardPeriod,
  RECENT_ORDER_NUMBERS,
  STOCK_ALERT_QUEUE,
} from '@/mocks/fixtures/dashboardData'
import { requireAdmin } from '@/mocks/lib/auth'
import { stockStatusOf } from './adminCoreProducts'

// New 24 + To pick 18 + To pack 12 + Ready to dispatch 8 = 62 pending shipments.
const PENDING_SHIPMENT_STATUSES = ['new', 'to_pick', 'to_pack', 'packed']

function buildFulfilment() {
  const countOf = (predicate) => db.orders.filter(predicate).length
  const stockAlerts = STOCK_ALERT_QUEUE.flatMap(({ productCode, severity }) => {
    const product = getProduct(productCode)
    return product && stockStatusOf(product) === 'low_stock'
      ? [{ productCode, name: product.name, stock: product.stock, severity }]
      : []
  })
  return {
    pendingShipments: countOf((order) => PENDING_SHIPMENT_STATUSES.includes(order.status)),
    readyToDispatch: countOf((order) => order.status === 'packed'),
    delayedOrders: countOf((order) => order.delay),
    lowStockCount: db.products.filter((product) => !product.deletedAt && stockStatusOf(product) === 'low_stock').length,
    stockAlerts,
  }
}

function buildRecentOrders() {
  return RECENT_ORDER_NUMBERS.map(getOrder)
    .filter(Boolean)
    .map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      placedAt: order.placedAt,
      grossAmount: order.summary.grossAmount,
      paymentStatus: order.paymentStatus,
      status: order.status,
    }))
}

export const adminDashboardHandlers = [
  defineHandler('get', '/admin/dashboard', ({ query, headers }) => {
    requireAdmin(headers)
    const period = getDashboardPeriod(query.period ?? DEFAULT_DASHBOARD_PERIOD)
    if (!period) throw new MockHttpError(422, 'Choose a valid reporting period.')

    return {
      data: {
        asOf: FIXTURE_NOW,
        period: { key: period.key, label: period.label, rangeLabel: period.rangeLabel, options: DASHBOARD_PERIODS },
        kpis: period.kpis,
        salesOverview: period.series,
        fulfilment: buildFulfilment(),
        recentOrders: buildRecentOrders(),
      },
    }
  }),
]
