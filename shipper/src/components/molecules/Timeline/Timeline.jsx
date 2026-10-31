import clsx from 'clsx'
import styles from './Timeline.module.scss'

const STATUS_TEXT = { done: 'Completed', current: 'Current step', upcoming: 'Upcoming' }

/**
 * Vertical progress list for order and shipment tracking.
 *   items: [{ key, title, description?, timestamp?, status: 'done' | 'current' | 'upcoming' }]
 * Statuses and timestamps come from the backend (the order status history / tracking events).
 * `timestamp` is displayed as given; format it with formatDateTime before passing it in.
 */
export default function Timeline({ items, className }) {
  return (
    <ol className={clsx(styles.timeline, className)}>
      {items.map((item) => (
        <li key={item.key} className={clsx(styles.item, styles[item.status])} aria-current={item.status === 'current' ? 'step' : undefined}>
          <span className={styles.dot} aria-hidden="true" />
          <div className={styles.content}>
            <p className={styles.title}>
              {item.title}
              <span className="visually-hidden"> — {STATUS_TEXT[item.status]}</span>
            </p>
            {item.description && <p className={styles.description}>{item.description}</p>}
            {item.timestamp && <p className={styles.timestamp}>{item.timestamp}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}