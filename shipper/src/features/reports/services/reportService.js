import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. Query parameters shared by both reports:
//   range      today | yesterday | last_7_days | last_30_days | this_month | last_month | custom
//   from, to   ISO dates (YYYY-MM-DD), only with range=custom
//   q          free-text search
// The backend resolves `range` against its own calendar and echoes the result as `period`.

/**
 * GET overview (+ compare: previous_month | previous_period | last_year | none) →
 *   { period: { preset, from, to, label|null }, compare: { key, label } | null,
 *     summary: { grossSales: { value, changePercent|null }, gstCollected: { value },
 *                averageOrderValue: { value, changePercent|null }, walletLiability: { value, customersWithBalance } },
 *     sales: { series: [{ key: 'current' | 'previous', label, total, points: [{ date, value }] }] },
 *     orderStatus: { totalOrders, items: [{ key, label, count, percent }] },
 *     customers: [{ code, name, ordersCount, totalSpend, walletBalance }],
 *     products: [{ code, name, units, grossSales, stock }] }
 * Every figure, share and total is computed by the backend.
 */
export async function getReportOverview(params) {
  const { data } = await http.get(endpoints.admin.reports.overview, { params })
  return data
}

/**
 * GET financial report (+ status, customer code, sort, page, pageSize) →
 *   { period, summary: { orders, lineItems, taxableValue, gstTotal, shippingTotal, grossAmount, walletUsed },
 *     items: [{ id, orderNumber, orderDate, customerCode, customerName, productCode, productName, hsn, gstPercent,
 *               quantity, taxable, gst, cgst, sgst, igst, shipping, wallet, lineTotal, net, status }],
 *     page, pageSize, totalItems, pageCount }
 * One item per order line; an order's shipping and wallet use sit on its first line.
 */
export async function getFinancialReport(params) {
  const { data } = await http.get(endpoints.admin.reports.financial, { params })
  return data
}

/**
 * GET reconciliation of one order →
 *   { orderNumber, reconciliation: { taxable, gst, shipping, gross, wallet, gateway, gatewayLabel, balanced },
 *     wallet: { customerCode, opening, used, closing } }
 */
export async function getOrderReconciliation(orderNumber) {
  const { data } = await http.get(endpoints.admin.reports.financialOrder(orderNumber))
  return data
}
