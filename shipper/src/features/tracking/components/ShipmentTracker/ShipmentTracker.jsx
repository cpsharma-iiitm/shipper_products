import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Timeline from '@/components/molecules/Timeline'
import { toTimelineItems } from '@/features/tracking/utils/timeline'
import styles from './ShipmentTracker.module.scss'

function ExternalLinkHint() {
  return <span className="visually-hidden"> (opens in a new tab)</span>
}

/**
 * Carrier, consignment link, the progress timeline and a "Track on India Post" button. Shared by the order
 * detail page and the public Track shipment page. `shipment` is null until the order is dispatched.
 *   shipment: { carrier, service, consignmentId, trackingUrl } | null
 *   timeline: [{ key, title, at, note, state }] as returned by the backend
 */
export default function ShipmentTracker({ shipment, timeline }) {
  return (
    <div className={styles.tracker}>
      {shipment && (
        <div className={styles.carrier}>
          <p className={styles.service}>
            {shipment.carrier} · {shipment.service}
          </p>
          <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className={styles.consignment}>
            Consignment ID: {shipment.consignmentId} <Icon name="arrow-up-right" />
            <ExternalLinkHint />
          </a>
        </div>
      )}

      <Timeline items={toTimelineItems(timeline)} />

      {shipment && (
        <Button as="a" variant="secondary" href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" rightIcon="arrow-up-right" className={styles.action}>
          Track on {shipment.carrier}
          <ExternalLinkHint />
        </Button>
      )}
    </div>
  )
}
