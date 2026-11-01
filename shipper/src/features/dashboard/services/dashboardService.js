import { endpoints, http } from '@/app/services'

/**
 * ASSUMPTION — confirm with backend team: GET /admin/dashboard?period=this_month|last_7_days|last_month.
 * Expected response (every figure is calculated by the backend; the UI only formats it):
 *   {
 *     asOf,
 *     period: { key, label, rangeLabel, options: [{ key, label }] },
 *     kpis: { grossSales | netRevenue | orders | customers:
 *             { value, changePercent | null, trend: 'up' | 'down' | 'flat', comparisonLabel | null, extra | null } },
 *     salesOverview: { currentLabel, previousLabel, points: [{ label, previousLabel, current, previous }] },
 *     fulfilment: { pendingShipments, readyToDispatch, delayedOrders, lowStockCount,
 *                   stockAlerts: [{ productCode, name, stock, severity: 'critical' | 'warning' }] },
 *     recentOrders: [{ orderNumber, customerName, placedAt, grossAmount, paymentStatus, status }]
 *   }
 */
export async function getDashboard(period) {
  const { data } = await http.get(endpoints.admin.dashboard.summary, { params: { period } })
  return data
}
