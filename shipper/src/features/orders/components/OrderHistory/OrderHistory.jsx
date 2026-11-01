import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { PaginationBar } from '@/components/molecules/Pagination'
import SearchField from '@/components/molecules/SearchField'
import SelectField from '@/components/molecules/SelectField'
import OrderCard from '@/features/orders/components/OrderCard'
import { DEFAULT_ORDER_FILTERS, ORDER_PERIOD_OPTIONS, ORDER_STATUS_OPTIONS, ORDERS_PAGE_SIZE } from '@/features/orders/constants/orderFilters'
import { useInvoiceDownload } from '@/features/orders/hooks/useInvoiceDownload'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useReorder } from '@/features/orders/hooks/useReorder'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import styles from './OrderHistory.module.scss'

const URL_DEFAULTS = { ...DEFAULT_ORDER_FILTERS, page: 1 }
const isOption = (options, value) => options.some((option) => option.value === value)

function OrderCardSkeleton() {
  return (
    <Card padding="lg" aria-hidden="true">
      <Skeleton width="11rem" height="1.25rem" />
      <Skeleton width="16rem" height="0.875rem" className={styles.skeletonLine} />
      <div className={styles.skeletonBody}>
        <Skeleton width="5.125rem" height="5.125rem" radius="0.75rem" />
        <Skeleton width="5.125rem" height="5.125rem" radius="0.75rem" />
        <Skeleton width="min(22rem, 40%)" height="1rem" />
      </div>
    </Card>
  )
}

/**
 * My orders: search, status and date filters, the paged list of order cards, and its loading, empty and error
 * states. Status, period and page live in the URL so the browser Back button returns to the same view; the
 * search text is local and debounced. Filtering, searching and paging are done by the backend.
 */
export default function OrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim())

  const status = isOption(ORDER_STATUS_OPTIONS, searchParams.get('status')) ? searchParams.get('status') : URL_DEFAULTS.status
  const period = isOption(ORDER_PERIOD_OPTIONS, searchParams.get('period')) ? searchParams.get('period') : URL_DEFAULTS.period
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || URL_DEFAULTS.page)

  const orders = useOrders({ page, pageSize: ORDERS_PAGE_SIZE, status, period, q: query })
  const reorder = useReorder()
  const invoice = useInvoiceDownload()

  const updateUrl = (changes) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(changes).forEach(([key, value]) => (value === URL_DEFAULTS[key] ? next.delete(key) : next.set(key, value)))
        return next
      },
      { replace: true },
    )

  const changeFilter = (key) => (value) => updateUrl({ [key]: value, page: 1 })
  const changeSearch = (value) => {
    setSearch(value)
    updateUrl({ page: 1 })
  }
  const showEverything = () => {
    setSearch('')
    setSearchParams({ period: 'all' }, { replace: true })
  }

  const isFiltered = query !== '' || status !== URL_DEFAULTS.status || period !== URL_DEFAULTS.period
  const items = orders.data?.items ?? []

  let content
  if (orders.isPending) {
    content = (
      <div className={styles.list} aria-busy="true" aria-label="Loading your orders">
        {[0, 1, 2].map((key) => (
          <OrderCardSkeleton key={key} />
        ))}
      </div>
    )
  } else if (orders.isError) {
    content = <ErrorState title="We couldn’t load your orders" message={getErrorMessage(orders.error)} onRetry={orders.refetch} />
  } else if (items.length === 0) {
    content = isFiltered ? (
      <EmptyState
        icon="search"
        title="No orders found"
        description="Try a different search, or widen the date range to see older orders."
        action={<Button variant="secondary" onClick={showEverything}>Show all orders</Button>}
      />
    ) : (
      <EmptyState
        icon="bag"
        title="No orders yet"
        description="When you place an order, you’ll be able to track it and reorder your favourites here."
        action={<Button as={Link} to={paths.shop}>Start shopping</Button>}
      />
    )
  } else {
    content = (
      <>
        <ul className={styles.list} aria-label="Your orders">
          {items.map((order) => (
            <li key={order.orderNumber}>
              <OrderCard
                order={order}
                onReorder={(entry) => reorder(entry.items)}
                onDownloadInvoice={invoice.mutate}
                invoiceLoading={invoice.isPending && invoice.variables === order.orderNumber}
              />
            </li>
          ))}
        </ul>
        <PaginationBar
          className={styles.pagination}
          page={orders.data.page}
          pageSize={orders.data.pageSize}
          totalItems={orders.data.totalItems}
          onPageChange={(next) => updateUrl({ page: next })}
          itemLabel="orders"
        />
      </>
    )
  }

  return (
    <div className={styles.history}>
      <div className={styles.toolbar}>
        <SearchField
          className={styles.search}
          size="sm"
          value={search}
          onChange={changeSearch}
          placeholder="Search your orders"
          aria-label="Search your orders by order number or product"
        />
        <SelectField
          size="sm"
          prefixLabel="Status:"
          aria-label="Filter orders by status"
          options={ORDER_STATUS_OPTIONS}
          value={status}
          onChange={changeFilter('status')}
        />
        <SelectField
          size="sm"
          prefixLabel="Date:"
          aria-label="Filter orders by date"
          options={ORDER_PERIOD_OPTIONS}
          value={period}
          onChange={changeFilter('period')}
        />
      </div>
      {content}
    </div>
  )
}
