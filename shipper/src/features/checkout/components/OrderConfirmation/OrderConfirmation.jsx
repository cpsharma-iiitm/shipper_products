import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import StatusBadge from '@/components/atoms/StatusBadge'
import Thumbnail from '@/components/atoms/Thumbnail'
import AddressSummary from '@/components/molecules/AddressSummary'
import Alert from '@/components/molecules/Alert'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { QuoteSummary } from '@/features/cart'
import { useOrderConfirmation } from '@/features/checkout/hooks/useOrderConfirmation'
import { formatDate, formatShortDate, formatTime } from '@/lib/date'
import { formatINR, pluralize } from '@/lib/format'
import styles from './OrderConfirmation.module.scss'

function ConfirmationSkeleton() {
  return (
    <div role="status" aria-label="Loading your order" className={styles.skeleton}>
      <Skeleton width="3.5rem" height="3.5rem" radius="50%" />
      <Skeleton width="min(24rem, 80%)" height="2rem" />
      <Skeleton width="min(16rem, 60%)" />
      <Skeleton height="16rem" radius="var(--sh-radius-lg)" />
    </div>
  )
}

/**
 * What happens after a customer pays: the order as the backend stored it, where and when it is going,
 * and what comes next. Rendered for /checkout/confirmation/:orderNumber.
 */
export default function OrderConfirmation({ orderNumber }) {
  const { data: order, isPending, isError, error, refetch } = useOrderConfirmation(orderNumber)

  if (isPending) return <ConfirmationSkeleton />
  if (isError) {
    if (error.status === 404) {
      return (
        <EmptyState
          icon="receipt"
          title="We couldn’t find this order"
          description={getErrorMessage(error)}
          action={
            <Button as={Link} to={paths.orders}>
              View my orders
            </Button>
          }
        />
      )
    }
    return <ErrorState title="We couldn’t load your order" message={getErrorMessage(error)} onRetry={refetch} />
  }

  const paid = order.paymentStatus === 'paid'
  const arrival = order.delivery.etaFrom ? `${formatShortDate(order.delivery.etaFrom)} – ${formatShortDate(order.delivery.etaTo)}` : null
  const firstName = order.customerName.split(' ')[0]

  return (
    <div className={styles.confirmation}>
      <header className={styles.hero}>
        <span className={styles.check} aria-hidden="true">
          <Icon name="check-lg" />
        </span>
        <h1 className={styles.title}>{paid ? `Thank you, ${firstName}. Your order is confirmed.` : `Thanks, ${firstName}. We’ve received your order.`}</h1>
        <p className={styles.meta}>
          Order <strong>{order.orderNumber}</strong> · Placed <span className={styles.nowrap}>{formatDate(order.placedAt)}</span> at <span className={styles.nowrap}>{formatTime(order.placedAt)}</span>
        </p>
        <p className={styles.payment}>
          <StatusBadge status={order.paymentStatus} />
          {paid ? `Paid via ${order.paymentMethod}` : `Payment ${order.paymentStatus === 'failed' ? 'did not go through' : 'is pending'}`}
        </p>
      </header>

      {!paid && (
        <Alert tone="warning" title="Payment isn’t complete yet">
          We’ll start preparing your order as soon as the payment is confirmed. You can check its status from My orders.
        </Alert>
      )}

      <div className={styles.layout}>
        <Card title={`Your order · ${pluralize(order.summary.units, 'unit')}`}>
          <ul className={styles.lines}>
            {order.lines.map((line) => (
              <li key={line.productCode} className={styles.line}>
                <Thumbnail src={line.image} size="md" />
                <div className={styles.lineText}>
                  <p className={styles.lineName}>{line.name}</p>
                  <p className={styles.lineMeta}>
                    {line.unit} · Qty {line.quantity}
                  </p>
                </div>
                <p className={styles.lineTotal}>{formatINR(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <QuoteSummary quote={{ summary: order.summary }} totalLabel={paid ? 'Total paid' : 'To pay'} />
        </Card>

        <div className={styles.side}>
          <Card title="Delivering to">
            <AddressSummary address={order.address} includeLandmark />
            {order.address.alternateMobile && <p className={styles.note}>Alternate mobile: {order.address.alternateMobile}</p>}
            {order.deliveryInstructions && <p className={styles.note}>Note for the courier: {order.deliveryInstructions}</p>}
            {arrival && (
              <p className={styles.arrival}>
                <Icon name="truck" />
                <span>
                  Expected delivery <strong>{arrival}</strong> · {order.delivery.method}
                </span>
              </p>
            )}
          </Card>

          <Card title="What happens next">
            <ol className={styles.steps}>
              <li>
                <strong>We pack your order.</strong> Our Lucknow team picks, checks and packs your items.
              </li>
              <li>
                <strong>It ships with India Post.</strong> You’ll get a tracking number as soon as it is on its way.
              </li>
              <li>
                <strong>Track it anytime.</strong> Follow every step from My orders.
              </li>
            </ol>
          </Card>
        </div>
      </div>

      <div className={styles.actions}>
        <Button as={Link} to={paths.order(order.orderNumber)} size="lg">
          View order
        </Button>
        <Button as={Link} to={paths.shop} variant="secondary" size="lg">
          Continue shopping
        </Button>
      </div>
    </div>
  )
}
