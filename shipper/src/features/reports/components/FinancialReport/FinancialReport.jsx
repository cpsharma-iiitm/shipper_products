import { useState } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import { DateRangeFilter, EXPORT_PAGE_SIZE, fetchAllPages, ListToolbar, REPORT_DATE_RANGES, StatGrid, useExcelExport, useListParams } from '@/features/admin-lists'
import { ORDER_STATUS_OPTIONS } from '@/features/admin-orders/constants/orderOptions'
import { useCustomerOptions } from '@/features/customers'
import ColumnsMenu from '@/features/reports/components/ColumnsMenu'
import FinancialLinesTable from '@/features/reports/components/FinancialLinesTable'
import { OPTIONAL_COLUMNS } from '@/features/reports/components/FinancialLinesTable/optionalColumns'
import FinancialSummary from '@/features/reports/components/FinancialSummary'
import ReconciliationCards from '@/features/reports/components/ReconciliationCards'
import { useFinancialReport, useOrderReconciliation } from '@/features/reports/hooks/useReports'
import { financialSheet, financialSheetRows } from '@/features/reports/lib/financialSheet'
import { getFinancialReport } from '@/features/reports/services/reportService'
import { formatNumber } from '@/lib/format'
import styles from './FinancialReport.module.scss'

// Matches the design's 4-row page; the pager reaches every line.
const PAGE_SIZE = 4

/** The Customer & order financial report screen (filters, summary, selectable line table, reconciliation). */
export default function FinancialReport() {
  const list = useListParams({ pageSize: PAGE_SIZE, filters: { range: 'this_month', from: '', to: '', status: '', customer: '' } })
  const { data, isPending, isError, error, refetch } = useFinancialReport(list.apiParams)
  const customerOptions = useCustomerOptions()
  const exporter = useExcelExport()
  const [visibleOptional, setVisibleOptional] = useState([])
  const [selection, setSelection] = useState({ scope: '', rows: [] })

  // A selection belongs to the filters it was made under; changing them starts a new one.
  const scope = JSON.stringify({ ...list.apiParams, page: undefined, sort: undefined })
  const selectedRows = selection.scope === scope ? selection.rows : []
  const rows = data?.items ?? []

  const changeSelection = (ids) => {
    const known = new Map([...selectedRows, ...rows].map((row) => [row.id, row]))
    setSelection({ scope, rows: ids.map((id) => known.get(id)).filter(Boolean) })
  }

  const focusedOrder = selectedRows[0]?.orderNumber ?? rows[0]?.orderNumber
  const reconciliation = useOrderReconciliation(focusedOrder)
  const selectedOrders = new Set(selectedRows.map((row) => row.orderNumber))

  // Export Excel covers every line matching the filters; Export selected only the ticked lines.
  const exportAll = () =>
    exporter.mutate({
      ...financialSheet(data.period),
      getRows: async () => financialSheetRows(await fetchAllPages((page) => getFinancialReport({ ...list.apiParams, page, pageSize: EXPORT_PAGE_SIZE }))),
    })

  const exportSelected = () => exporter.mutate({ ...financialSheet(data.period), getRows: async () => financialSheetRows(selectedRows) })

  const toolbarFilters = [
    {
      key: 'range',
      node: (
        <DateRangeFilter
          compact
          label="Report period"
          value={{ range: list.filters.range, from: list.filters.from, to: list.filters.to }}
          period={data?.period}
          presets={REPORT_DATE_RANGES}
          onChange={list.setFilters}
        />
      ),
    },
    {
      key: 'status',
      label: 'Order status',
      prefix: 'Status:',
      options: ORDER_STATUS_OPTIONS,
      value: list.filters.status,
      onChange: (value) => list.setFilter('status', value),
    },
    {
      key: 'customer',
      label: 'Customer',
      prefix: 'Customer:',
      searchable: true,
      options: [{ value: '', label: 'All' }, ...(customerOptions.data ?? []).map((customer) => ({ value: customer.code, label: `${customer.name} · ${customer.code}` }))],
      value: list.filters.customer,
      onChange: (value) => list.setFilter('customer', value),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader
        title="Customer & order financial report"
        description={
          <>
            <Link to={paths.admin.reports} className={styles.crumb}>
              Reports
            </Link>{' '}
            / Detailed report · GST-inclusive line items with wallet reconciliation.
          </>
        }
        actions={
          <Button size="sm" disabled={!data} loading={exporter.isPending && !selectedRows.length} onClick={exportAll}>
            Export Excel
          </Button>
        }
      />

      <ListToolbar
        search={{ ...list.search, label: 'Search customer, product or order ID', placeholder: 'Search customer, product or order ID' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      />

      {isError && <ErrorState message={getErrorMessage(error)} onRetry={refetch} />}

      {!isError && (
        <>
          {data ? (
            <FinancialSummary summary={data.summary} />
          ) : (
            <StatGrid>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} height="7.1rem" radius="var(--sh-radius-md)" />
              ))}
            </StatGrid>
          )}

          <Card padding="sm" radius="md" className={styles.tableCard} aria-label="Financial report lines">
            <div className={styles.tableHeader}>
              <p className={styles.selection}>
                {selectedRows.length > 0 ? (
                  <>
                    <span className={styles.selectedCount}>{formatNumber(selectedRows.length)} selected</span>
                    <span className={styles.selectionNote}>
                      Order {selectedRows[0].orderNumber}
                      {selectedOrders.size > 1 && ` +${selectedOrders.size - 1} more`} · Product-line view
                    </span>
                  </>
                ) : (
                  <span className={styles.selectionNote}>Product-line view · select lines to export them or see an order&rsquo;s reconciliation</span>
                )}
              </p>
              <div className={styles.tableActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedRows.length === 0}
                  loading={exporter.isPending && selectedRows.length > 0}
                  onClick={exportSelected}
                >
                  Export selected
                </Button>
                <ColumnsMenu options={OPTIONAL_COLUMNS} visible={visibleOptional} onChange={setVisibleOptional} />
              </div>
            </div>
            <FinancialLinesTable
              className={styles.table}
              rows={rows}
              visibleOptional={visibleOptional}
              loading={isPending}
              sort={list.sortState}
              onSortChange={list.setSort}
              selectedIds={selectedRows.map((row) => row.id)}
              onSelectionChange={changeSelection}
              pagination={
                data && {
                  page: data.page,
                  pageSize: data.pageSize,
                  totalItems: data.totalItems,
                  onPageChange: list.setPage,
                  itemLabel: 'product lines',
                }
              }
            />
          </Card>

          {reconciliation.data && <ReconciliationCards data={reconciliation.data} selected={selectedRows.length > 0} />}
        </>
      )}
    </div>
  )
}
