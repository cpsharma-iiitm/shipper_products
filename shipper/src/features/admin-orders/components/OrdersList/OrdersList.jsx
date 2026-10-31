import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import StatCard from '@/components/molecules/StatCard'
import { DateRangeFilter, EXPORT_PAGE_SIZE, fetchAllPages, LIST_DATE_RANGES, ListToolbar, StatGrid, useExcelExport, useListParams } from '@/features/admin-lists'
import OrdersTable from '@/features/admin-orders/components/OrdersTable'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/features/admin-orders/constants/orderOptions'
import { useAdminOrders } from '@/features/admin-orders/hooks/useAdminOrders'
import { ordersSheet, ordersSheetRows } from '@/features/admin-orders/lib/ordersSheet'
import { listAdminOrders } from '@/features/admin-orders/services/adminOrderService'
import { formatNumber } from '@/lib/format'
import styles from './OrdersList.module.scss'

// The summary cards are shortcuts to the same status filter as the "Status" select.
const SUMMARY_CARDS = [
  { status: '', label: 'All orders', count: 'all' },
  { status: 'new', label: 'New', count: 'new' },
  { status: 'in_transit', label: 'In transit', count: 'in_transit' },
  { status: 'delivered', label: 'Delivered', count: 'delivered' },
]

/** The admin Orders screen: every order with search, filters, sort, paging and Excel export. */
export default function OrdersList() {
  const navigate = useNavigate()
  const list = useListParams({ pageSize: 10, filters: { status: '', payment: '', range: 'all', from: '', to: '' } })
  const { data, isPending, isError, error, refetch } = useAdminOrders(list.apiParams)
  const exporter = useExcelExport()

  const exportOrders = () =>
    exporter.mutate({
      ...ordersSheet,
      getRows: async () => ordersSheetRows(await fetchAllPages((page) => listAdminOrders({ ...list.apiParams, page, pageSize: EXPORT_PAGE_SIZE }))),
    })

  const toolbarFilters = [
    {
      key: 'status',
      label: 'Order status',
      prefix: 'Status:',
      options: ORDER_STATUS_OPTIONS,
      value: list.filters.status,
      onChange: (value) => list.setFilter('status', value),
    },
    {
      key: 'payment',
      label: 'Payment status',
      prefix: 'Payment:',
      options: PAYMENT_STATUS_OPTIONS,
      value: list.filters.payment,
      onChange: (value) => list.setFilter('payment', value),
    },
    {
      key: 'range',
      node: (
        <DateRangeFilter
          label="Order date"
          prefix="Date:"
          value={{ range: list.filters.range, from: list.filters.from, to: list.filters.to }}
          presets={LIST_DATE_RANGES}
          onChange={list.setFilters}
        />
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader title="Orders" description="Search every order, check its payment and delivery status, and open the full details." />

      <StatGrid>
        {SUMMARY_CARDS.map((card) => (
          <StatCard
            key={card.label}
            layout="inline"
            label={card.label}
            value={data ? formatNumber(data.counts[card.count] ?? 0) : '—'}
            selected={list.filters.status === card.status}
            onClick={() => list.setFilter('status', list.filters.status === card.status ? '' : card.status)}
          />
        ))}
      </StatGrid>

      <ListToolbar
        search={{ ...list.search, label: 'Search orders', placeholder: 'Search order, customer or mobile' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      >
        <Button variant="secondary" size="sm" leftIcon="download" disabled={!data} loading={exporter.isPending} onClick={exportOrders}>
          Export
        </Button>
      </ListToolbar>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <OrdersTable
          rows={data?.items ?? []}
          loading={isPending}
          sort={list.sortState}
          onSortChange={list.setSort}
          onOpen={(orderNumber) => navigate(paths.admin.order(orderNumber))}
          emptyState={
            <EmptyState
              compact
              icon="clipboard-x"
              title="No orders match these filters"
              description="Try a different search, or clear the filters to see every order."
              action={
                <Button variant="secondary" size="sm" onClick={list.reset}>
                  Clear filters
                </Button>
              }
            />
          }
          pagination={
            data && { page: data.page, pageSize: data.pageSize, totalItems: data.totalItems, onPageChange: list.setPage, itemLabel: 'orders' }
          }
        />
      )}
    </div>
  )
}
