import Alert from '@/components/molecules/Alert'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import { CHECKOUT_COPY } from '@/features/checkout/lib/checkoutCopy'
import { formatShortDate } from '@/lib/date'
import { formatINR } from '@/lib/format'
import styles from './ShippingSection.module.scss'

/**
 * The delivery option the backend quoted for the chosen address: carrier and service, fee and arrival
 * window (`quote.delivery`). There is a single method, so it is shown as the selected option, not a choice.
 */
export default function ShippingSection({ delivery, compact }) {
  const copy = CHECKOUT_COPY[compact ? 'compact' : 'wide']
  const fee = delivery?.fee > 0 ? formatINR(delivery.fee, { decimals: 2 }) : 'Free'

  let content
  if (!delivery) {
    content = (
      <div className={styles.loading}>
        <Skeleton width="45%" height="1.125rem" />
        <Skeleton width="60%" />
      </div>
    )
  } else if (delivery.serviceable === false) {
    content = (
      <Alert tone="warning" title="We can’t deliver to this address yet">
        Choose another address or add a new one to see delivery options.
      </Alert>
    )
  } else if (!delivery.serviceable) {
    content = <p className={styles.note}>Choose a delivery address to see delivery options.</p>
  } else {
    const arrival = `${formatShortDate(delivery.etaFrom)} – ${formatShortDate(delivery.etaTo)}`
    content = (
      <>
        <div className={styles.method}>
          <p className={styles.name}>
            <Icon name="record-circle-fill" className={styles.marker} />
            {delivery.method}
          </p>
          {!compact && <p className={styles.fee}>{fee}</p>}
        </div>
        <p className={styles.note}>
          {compact ? arrival : `Arrives ${arrival}`} · {compact ? 'Tracked shipping' : 'Tracked delivery'}
        </p>
        {compact && (
          <p className={styles.feeRow}>
            <span>Delivery fee</span>
            <span className={styles.feeValue}>{fee}</span>
          </p>
        )}
      </>
    )
  }

  return (
    <Card title={copy.shippingTitle} padding={compact ? 'sm' : 'md'} aria-live="polite">
      {content}
    </Card>
  )
}
