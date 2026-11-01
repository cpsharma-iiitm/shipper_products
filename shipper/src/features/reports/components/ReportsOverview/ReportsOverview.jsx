import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import { DateRangeFilter, ListToolbar, REPORT_DATE_RANGES, StatGrid, useExcelExport, useListParams } from '@/features/admin-lists'
import OrderStatusCard from '@/features/reports/components/OrderStatusCard'
import ReportKpis from '@/features/reports/components/ReportKpis'
import ReportTableCard from '@/features/reports/components/ReportTableCard'
import SalesAnalyticsCard from '@/features/reports/components/SalesAnalyticsCard'
import { useReportOverview } from '@/features/reports/hooks/useReports'
import { buildOverviewSheet } from '@/features/reports/lib/overviewSheet'
import { formatINR, formatNumber } from '@/lib/format'
import styles from './ReportsOverview.module.scss'

const COMPARE_OPTIONS = [
  { value: 'previous_month', label: 'Previous month' },
  { value: 'previous_period', label: 'Previous period' },
  { value: 'last_year', label: 'Same period last year' },
  { value: 'none', label: 'No comparison' },
]

const CUSTOMER_COLUMNS = [
  { key: 'name', header: 'Customer' },
  { key: 'ordersCount', header: 'Orders', cell: (row) => formatNumber(row.ordersCount) },
  { key: 'totalSpend', header: 'Sales', cell: (row) => formatINR(row.totalSpend) },
  { key: 'walletBalance', header: 'Wallet', cell: (row) => formatINR(row.walletBalance) },
]

const PRODUCT_COLUMNS = [
  { key: 'name', header: 'Product / code', cell: (row) => `${row.name} · ${row.code}` },
  { key: 'units', header: 'Units', cell: (row) => formatNumber(row.units) },
  { key: 'grossSales', header: 'Gross sales', cell: (row) => formatINR(row.grossSales) },
  { key: 'stock', header: 'Stock', cell: (row) => formatNumber(row.stock) },
]

function OverviewSkeleton() {
  return (
    <div className={styles.stack} aria-busy="true" aria-label="Loading reports">
      <StatGrid>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height="7.1rem" radius="var(--sh-radius-md)" />
        ))}
      </StatGrid>
      <Skeleton height="19rem" radius="var(--sh-radius-md)" />
      <Skeleton height="14rem" radius="var(--sh-radius-md)" />
    </div>
  )
}

/** The Reports overview screen: filters, headline figures, sales chart, order mix and two top-lists. */
export default function ReportsOverview() {
  const list = useListParams({ pageSize: null, filters: { range: 'this_month', from: '', to: '', compare: 'previous_month' } })
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useReportOverview(list.apiParams)
  const exporter = useExcelExport()

  const toolbarFilters = [
    {
      key: 'range',
      node: (
        <DateRangeFilter
          label="Report period"
          value={{ range: list.filters.range, from: list.filters.from, to: list.filters.to }}
          period={data?.period}
          presets={REPORT_DATE_RANGES}
          onChange={list.setFilters}
        />
      ),
    },
    {
      key: 'compare',
      label: 'Compare with',
      prefix: 'Compare:',
      options: COMPARE_OPTIONS,
      value: list.filters.compare,
      onChange: (value) => list.setFilter('compare', value),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader
        title="Reports overview"
        description="A clear view of sales, customers, products and wallet activity."
        actions={
          <Button
            size="sm"
            disabled={!data}
            loading={exporter.isPending}
            onClick={() => {
              const { rows, ...sheet } = buildOverviewSheet(data)
              exporter.mutate({ ...sheet, getRows: async () => rows })
            }}
          >
            Export Excel
          </Button>
        }
      />

      <ListToolbar
        search={{ ...list.search, label: 'Search a report', placeholder: 'Search a report' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      />

      {isPending && <OverviewSkeleton />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={refetch} />}
      {data && (
        <div className={styles.stack}>
          <ReportKpis summary={data.summary} />
          <div className={styles.chartRow}>
            <SalesAnalyticsCard sales={data.sales} period={data.period} busy={isPlaceholderData} />
            <OrderStatusCard orderStatus={data.orderStatus} />
          </div>
          <div className={styles.tableRow}>
            <ReportTableCard
              title="Customers & wallet balances"
              caption="Customers with their orders, sales and wallet balance"
              columns={CUSTOMER_COLUMNS}
              rows={data.customers}
              getRowId={(row) => row.code}
              emptyState={<EmptyState compact icon="people" title="No matching customers" description="Try a different search." />}
              linkLabel="View customer financial report"
              linkTo={paths.admin.financialReport}
            />
            <ReportTableCard
              title="Product performance"
              caption="Products with units sold, gross sales and stock"
              columns={PRODUCT_COLUMNS}
              rows={data.products}
              getRowId={(row) => row.code}
              emptyState={<EmptyState compact icon="box-seam" title="No matching products" description="Try a different search." />}
              linkLabel="View product details & GST"
              linkTo={paths.admin.products}
            />
          </div>
        </div>
      )}
    </div>
  )
}
