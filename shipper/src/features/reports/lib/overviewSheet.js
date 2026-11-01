import { formatDate, formatDateRange } from '@/lib/date'

// One flat sheet holds every section of the overview, so each row names its section.
const COLUMNS = [
  { header: 'Section', key: 'section', width: 34 },
  { header: 'Item', key: 'item', width: 40 },
  { header: 'Count', key: 'count', format: 'number', width: 12 },
  { header: 'Amount', key: 'amount', format: 'inr', width: 16 },
  { header: 'Wallet balance', key: 'wallet', format: 'inr', width: 16 },
  { header: 'Stock', key: 'stock', format: 'number', width: 10 },
  { header: 'Share', key: 'share', format: 'percent', width: 10 },
]

/** The rows currently on the Reports overview, as an Excel sheet definition for exportToExcel. */
export function buildOverviewSheet(report) {
  const { summary, sales, orderStatus, customers, products, period } = report
  const rows = [
    { section: 'Summary', item: 'Gross sales', amount: summary.grossSales.value },
    { section: 'Summary', item: 'GST collected', amount: summary.gstCollected.value },
    { section: 'Summary', item: 'Average order value', amount: summary.averageOrderValue.value },
    { section: 'Summary', item: 'Wallet liability', amount: summary.walletLiability.value, count: summary.walletLiability.customersWithBalance },
    ...sales.series.flatMap((series) =>
      series.points.map((point) => ({ section: `Daily gross sales · ${series.label}`, item: formatDate(point.date), amount: point.value })),
    ),
    ...orderStatus.items.map((item) => ({ section: 'Order status', item: item.label, count: item.count, share: item.percent })),
    ...customers.map((customer) => ({
      section: 'Customers and wallet balances',
      item: `${customer.name} · ${customer.code}`,
      count: customer.ordersCount,
      amount: customer.totalSpend,
      wallet: customer.walletBalance,
    })),
    ...products.map((product) => ({
      section: 'Product performance',
      item: `${product.name} · ${product.code}`,
      count: product.units,
      amount: product.grossSales,
      stock: product.stock,
    })),
  ]
  return {
    fileName: `Shipper-reports-overview-${period.from}-to-${period.to}`,
    sheetName: 'Reports overview',
    title: `Reports overview · ${formatDateRange(period.from, period.to)}`,
    columns: COLUMNS,
    rows,
  }
}
