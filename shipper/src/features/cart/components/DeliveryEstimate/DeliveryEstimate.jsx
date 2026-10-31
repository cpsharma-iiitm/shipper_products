import Icon from '@/components/atoms/Icon'
import DeliveryLocation from '@/features/storefront/components/DeliveryLocation'
import { formatShortDate } from '@/lib/date'
import styles from './DeliveryEstimate.module.scss'

/**
 * Where the cart is going and when it should arrive: the PIN picker plus the backend's serviceability and
 * ETA for that PIN (`quote.delivery`). The PIN itself is a UI preference shared with the header.
 */
export default function DeliveryEstimate({ delivery }) {
  const notServiceable = delivery?.serviceable === false
  const arrives = delivery?.serviceable ? `${formatShortDate(delivery.etaFrom)} – ${formatShortDate(delivery.etaTo)}` : null

  return (
    <div className={styles.row}>
      <DeliveryLocation variant="inline" />
      <p className={notServiceable ? styles.problem : styles.eta} role={notServiceable ? 'alert' : undefined}>
        {notServiceable && (
          <>
            <Icon name="exclamation-circle" /> We don’t deliver to {delivery.pin} yet. Try another PIN code.
          </>
        )}
        {arrives && (
          <>
            <Icon name="truck" /> Arrives {arrives}
          </>
        )}
        {!delivery?.pin && 'Add your PIN code to see delivery dates.'}
      </p>
    </div>
  )
}
