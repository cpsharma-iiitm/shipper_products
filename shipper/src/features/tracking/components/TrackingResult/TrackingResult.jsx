import { useEffect, useRef } from 'react'
import Card from '@/components/atoms/Card'
import OrderHeroCard from '@/features/orders/components/OrderHeroCard'
import ShipmentTracker from '@/features/tracking/components/ShipmentTracker'
import { formatDate } from '@/lib/date'
import { pluralize } from '@/lib/format'
import styles from './TrackingResult.module.scss'

/**
 * The outcome of a lookup: the order, where it is and the progress so far. Focus moves here when a result
 * appears, so keyboard and screen-reader users land on it (it sits below the form on phones).
 */
export default function TrackingResult({ tracking }) {
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className={styles.result} aria-labelledby="tracking-result-heading">
      <header>
        <h2 id="tracking-result-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
          Order #{tracking.orderNumber}
        </h2>
        <p className={styles.meta}>
          Placed {formatDate(tracking.placedAt)} · {pluralize(tracking.units, 'unit')}
        </p>
      </header>
      <OrderHeroCard order={tracking} />
      <Card title="Shipment progress" padding="lg">
        <ShipmentTracker shipment={tracking.shipment} timeline={tracking.timeline} />
      </Card>
    </section>
  )
}
