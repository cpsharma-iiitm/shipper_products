import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import StatCard from '@/components/molecules/StatCard'
import { StatGrid } from '@/features/admin-lists'
import CustomerRecentOrdersCard from '@/features/customers/components/CustomerRecentOrdersCard'
import CustomerSidePanels from '@/features/customers/components/CustomerSidePanels'
import CustomerWalletCard from '@/features/customers/components/CustomerWalletCard'
import { useCustomer } from '@/features/customers/hooks/useCustomers'
import { formatDate } from '@/lib/date'
import { formatINR, formatNumber } from '@/lib/format'
import styles from './CustomerDetail.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

function DetailSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading customer">
      <Skeleton height="4.5rem" radius="var(--sh-radius-md)" />
      <div className={styles.columns}>
        <div className={styles.stack}>
          <Skeleton height="14rem" radius="var(--sh-radius-md)" />
          <Skeleton height="12rem" radius="var(--sh-radius-md)" />
        </div>
        <Skeleton height="18rem" radius="var(--sh-radius-md)" />
      </div>
    </div>
  )
}

/** Admin customer detail: profile, headline numbers, wallet ledger and recent orders. Read-only. */
export default function CustomerDetail({ code }) {
  const { data, isPending, isError, error, refetch } = useCustomer(code)
  const customer = data?.customer

  const header = (
    <PageHeader
      title={customer?.name ?? `Customer ${code}`}
      description={customer ? `${customer.code} · Customer since ${formatDate(customer.joinedAt)}` : undefined}
      actions={
        <>
          <Button as={Link} to={paths.admin.customers} variant="secondary" size="sm" leftIcon="arrow-left">
            All customers
          </Button>
          {customer && (
            <Button as={Link} to={`${paths.admin.orders}?q=${encodeURIComponent(customer.code)}`} variant="secondary" size="sm" leftIcon="bag">
              View orders
            </Button>
          )}
        </>
      }
    />
  )

  if (isError) {
    return (
      <div className={styles.page}>
        {header}
        <ErrorState
          title="We could not open this customer"
          message={getErrorMessage(error)}
          onRetry={error.status === 404 ? undefined : refetch}
        />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className={styles.page}>
        {header}
        <DetailSkeleton />
      </div>
    )
  }

  const { stats } = data
  return (
    <div className={styles.page}>
      {header}

      <StatGrid>
        <StatCard label="Orders" value={formatNumber(stats.ordersCount)} hint={stats.lastOrderAt ? `Last order ${formatDate(stats.lastOrderAt)}` : 'No orders yet'} />
        <StatCard label="Total spend" value={money(stats.totalSpend)} />
        <StatCard label="Average order value" value={money(stats.averageOrderValue)} />
        <StatCard label="Wallet balance" value={money(stats.walletBalance)} />
      </StatGrid>

      <div className={styles.columns}>
        <div className={styles.stack}>
          <CustomerRecentOrdersCard orders={data.recentOrders} customerCode={customer.code} />
          <CustomerWalletCard transactions={data.walletTransactions} />
        </div>
        <CustomerSidePanels customer={customer} addresses={data.addresses} />
      </div>
    </div>
  )
}
