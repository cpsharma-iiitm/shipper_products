// DEV FIXTURES — admin dashboard aggregates (pure data, no imports).
//
// Real aggregates (sales, revenue, order and customer counts, trend lines) are computed by the backend
// from orders and payments. Here they are static constants that reproduce the dashboard in the design
// (This month: ₹4,82,560 gross, ₹4,12,780 net, 1,284 orders, 3,856 customers); queue and stock counts
// are read live from the mock db by the handler. Every shape is an ASSUMPTION — confirm with backend team.

export const DASHBOARD_PERIODS = [
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
]

export const DEFAULT_DASHBOARD_PERIOD = 'this_month'

/** Orders shown under "Recent orders" (the four in the design). */
export const RECENT_ORDER_NUMBERS = ['SH10482', 'SH10483', 'SH10484', 'SH10485']

/**
 * Stock alerts raised for the dashboard panel, most recent first. The handler reads the live stock
 * from the db, so an alert disappears once the product is restocked. Severity is the backend's
 * judgement (for example days of cover at the current sales rate), not derived from the count.
 */
export const STOCK_ALERT_QUEUE = [
  { productCode: 'PC006', severity: 'critical' },
  { productCode: 'CO068', severity: 'warning' },
]

const SHAPES = {
  // [day, relative height 0–1] control points traced from the revenue chart in the design.
  thisMonth: [[1, 0.07], [4, 0.31], [5.5, 0.25], [9, 0.45], [9.5, 0.44], [12.5, 0.68], [16, 0.56], [17.3, 0.6], [19, 0.86], [21.5, 0.78], [24, 0.95], [28, 0.96]],
  lastMonth: [[1, 0.01], [4, 0.03], [6.7, 0.39], [9.5, 0.31], [12.5, 0.52], [16, 0.46], [19, 0.72], [21.5, 0.61], [24, 0.76], [28, 0.81]],
  week: [[1, 0.4], [2, 0.55], [3, 0.5], [4, 0.7], [5, 0.65], [6, 0.85], [7, 0.9]],
  previousWeek: [[1, 0.35], [2, 0.45], [3, 0.5], [4, 0.55], [5, 0.6], [6, 0.7], [7, 0.75]],
  september: [[1, 0.2], [5, 0.35], [9, 0.3], [14, 0.55], [18, 0.5], [23, 0.75], [27, 0.7], [30, 0.85]],
  august: [[1, 0.15], [6, 0.3], [11, 0.28], [16, 0.5], [21, 0.45], [26, 0.62], [30, 0.7]],
}

const MONTH_NAMES = { 8: 'Aug', 9: 'Sep', 10: 'Oct' }
const dayLabel = (month, day) => `${String(day).padStart(2, '0')} ${MONTH_NAMES[month]}`

function interpolate(controlPoints, count) {
  return Array.from({ length: count }, (_, index) => {
    const day = 1 + (index * (controlPoints.at(-1)[0] - 1)) / Math.max(1, count - 1)
    const upper = controlPoints.findIndex(([at]) => at >= day)
    if (upper <= 0) return controlPoints[0][1]
    const [fromAt, fromValue] = controlPoints[upper - 1]
    const [toAt, toValue] = controlPoints[upper]
    return fromValue + ((toValue - fromValue) * (day - fromAt)) / (toAt - fromAt)
  })
}

/** Whole-rupee daily values that follow `shape` and add up to exactly `total` (the last day absorbs rounding). */
function distribute(shape, count, total) {
  const weights = interpolate(shape, count).map((value) => 0.35 + value)
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  const values = weights.map((weight) => Math.round((total * weight) / weightSum))
  values[count - 1] += total - values.reduce((sum, value) => sum + value, 0)
  return values
}

function buildSeries({ count, currentShape, previousShape, currentTotal, previousTotal, currentLabelOf, previousLabelOf, currentName, previousName }) {
  const current = distribute(currentShape, count, currentTotal)
  const previous = distribute(previousShape, count, previousTotal)
  return {
    currentLabel: currentName,
    previousLabel: previousName,
    points: current.map((value, index) => ({
      label: currentLabelOf(index + 1),
      previousLabel: previousLabelOf(index + 1),
      current: value,
      previous: previous[index],
    })),
  }
}

const PERIODS = {
  this_month: {
    label: 'This month',
    rangeLabel: '01–28 October 2026',
    kpis: {
      grossSales: { value: 482560, changePercent: 12.8, trend: 'up', comparisonLabel: 'vs last month', extra: null },
      netRevenue: { value: 412780, changePercent: 10.4, trend: 'up', comparisonLabel: 'vs last month', extra: null },
      orders: { value: 1284, changePercent: 8.2, trend: 'up', comparisonLabel: null, extra: '42 today' },
      customers: { value: 3856, changePercent: null, trend: 'up', comparisonLabel: null, extra: '186 new this month' },
    },
    series: () =>
      buildSeries({
        count: 28,
        currentShape: SHAPES.thisMonth,
        previousShape: SHAPES.lastMonth,
        currentTotal: 412780,
        previousTotal: 373895,
        currentLabelOf: (day) => dayLabel(10, day),
        previousLabelOf: (day) => dayLabel(9, day),
        currentName: 'This month',
        previousName: 'Last month',
      }),
  },
  last_7_days: {
    label: 'Last 7 days',
    rangeLabel: '22–28 October 2026',
    kpis: {
      grossSales: { value: 118420, changePercent: 6.1, trend: 'up', comparisonLabel: 'vs previous 7 days', extra: null },
      netRevenue: { value: 101350, changePercent: 5.4, trend: 'up', comparisonLabel: 'vs previous 7 days', extra: null },
      orders: { value: 301, changePercent: 4.8, trend: 'up', comparisonLabel: null, extra: '42 today' },
      customers: { value: 3856, changePercent: null, trend: 'up', comparisonLabel: null, extra: '47 new in 7 days' },
    },
    series: () =>
      buildSeries({
        count: 7,
        currentShape: SHAPES.week,
        previousShape: SHAPES.previousWeek,
        currentTotal: 101350,
        previousTotal: 96150,
        currentLabelOf: (day) => dayLabel(10, 21 + day),
        previousLabelOf: (day) => dayLabel(10, 14 + day),
        currentName: 'Last 7 days',
        previousName: 'Previous 7 days',
      }),
  },
  last_month: {
    label: 'Last month',
    rangeLabel: '01–30 September 2026',
    kpis: {
      grossSales: { value: 427801, changePercent: 9.6, trend: 'up', comparisonLabel: 'vs August', extra: null },
      netRevenue: { value: 373895, changePercent: 7.9, trend: 'up', comparisonLabel: 'vs August', extra: null },
      orders: { value: 1187, changePercent: 5.3, trend: 'up', comparisonLabel: null, extra: '39 a day on average' },
      customers: { value: 3670, changePercent: null, trend: 'up', comparisonLabel: null, extra: '203 new in September' },
    },
    series: () =>
      buildSeries({
        count: 30,
        currentShape: SHAPES.september,
        previousShape: SHAPES.august,
        currentTotal: 373895,
        previousTotal: 346550,
        currentLabelOf: (day) => dayLabel(9, day),
        previousLabelOf: (day) => dayLabel(8, day),
        currentName: 'Last month',
        previousName: 'Previous month',
      }),
  },
}

/** The period's figures, or null for an unknown key. */
export function getDashboardPeriod(key) {
  const period = PERIODS[key]
  if (!period) return null
  return { key, label: period.label, rangeLabel: period.rangeLabel, kpis: period.kpis, series: period.series() }
}
