import { Link } from 'react-router-dom'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import { paths } from '@/app/router/paths'
import { pluralize } from '@/lib/format'
import styles from './StockExceptions.module.scss'

/** Orders held because the warehouse cannot cover them. Renders nothing when there are none. */
export default function StockExceptions({ exceptions, onSelect }) {
  if (exceptions.length === 0) return null

  return (
    <Card title={`Stock exception · ${pluralize(exceptions.length, 'order')}`} padding="sm">
      <ul className={styles.list}>
        {exceptions.map((exception) => (
          <li key={exception.orderNumber} className={styles.item}>
            <button type="button" className={styles.badge} onClick={() => onSelect(exception.orderNumber)}>
              {exception.orderNumber}
              {exception.onHold && ' · On hold'}
            </button>
            <p className={styles.detail}>{exception.detail}</p>
          </li>
        ))}
      </ul>
      <Link className={styles.link} to={paths.admin.restock}>
        Raise restock request <Icon name="arrow-right" />
      </Link>
    </Card>
  )
}
