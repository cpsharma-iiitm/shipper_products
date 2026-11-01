import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge'
import { getOrderHero } from '@/features/orders/utils/orderCopy'
import styles from './OrderHeroCard.module.scss'

/** The tinted summary at the top of an order: when it arrives (or arrived), the status and the latest update. */
export default function OrderHeroCard({ order }) {
  const { eyebrow, title, detail } = getOrderHero(order)

  return (
    <section className={styles.hero} aria-label="Delivery status">
      <div className={styles.text}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <p className={styles.title}>{title}</p>
        <p className={styles.detail}>{detail}</p>
      </div>
      <OrderStatusBadge status={order.status} className={styles.status} />
    </section>
  )
}
