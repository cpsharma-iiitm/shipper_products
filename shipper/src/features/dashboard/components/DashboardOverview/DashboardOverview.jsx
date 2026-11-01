import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { selectCurrentUser } from '@/app/store'
import Button from '@/components/atoms/Button'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import { getErrorMessage } from '@/app/services'
import FulfilmentCard from '@/features/dashboard/components/FulfilmentCard'
import KpiGrid from '@/features/dashboard/components/KpiGrid'
import PeriodMenu from '@/features/dashboard/components/PeriodMenu'
import RecentOrdersCard from '@/features/dashboard/components/RecentOrdersCard'
import SalesOverviewCard from '@/features/dashboard/components/SalesOverviewCard'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { getGreeting } from '@/features/dashboard/utils/getGreeting'
import { formatDate } from '@/lib/date'
import styles from './DashboardOverview.module.scss'

const DEFAULT_PERIOD = 'this_month'

/** Admin home: greeting, headline figures, sales trend, fulfilment queue and recent orders. */
export default function DashboardOverview() {
  const user = useSelector(selectCurrentUser)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const { data, isError, error, refetch } = useDashboard(period)

  const firstName = user?.name?.split(' ')[0]
  const greeting = data ? getGreeting(data.asOf) : 'Welcome'

  return (
    <div className={styles.page}>
      <PageHeader
        title={
          <>
            {greeting}
            {firstName && `, ${firstName}`} <span aria-hidden="true">👋</span>
          </>
        }
        description={data ? `Here’s what’s happening across Shipper.com today, ${formatDate(data.asOf)}.` : 'Loading today’s figures…'}
        actions={
          <div className={styles.quickActions}>
            <Button as={Link} to={paths.admin.newPurchase} variant="secondary" size="sm" leftIcon="cart-plus">
              Create purchase
            </Button>
            <Button as={Link} to={`${paths.admin.products}?stock=low`} variant="secondary" size="sm" leftIcon="exclamation-triangle">
              Low-stock products
            </Button>
            {data && <PeriodMenu value={data.period.key} label={data.period.label} options={data.period.options} onChange={setPeriod} />}
          </div>
        }
      />

      {isError && !data ? (
        <ErrorState title="The dashboard could not be loaded" message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <>
          <KpiGrid kpis={data?.kpis} />
          <div className={styles.panels}>
            <SalesOverviewCard rangeLabel={data?.period.rangeLabel} series={data?.salesOverview} />
            <FulfilmentCard fulfilment={data?.fulfilment} />
          </div>
          <RecentOrdersCard orders={data?.recentOrders} />
        </>
      )}
    </div>
  )
}
