import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import { formatINR } from '@/lib/format'
import styles from './OrderItemsCard.module.scss'

/** What is being bought, read-only, with a way back to the cart. `cartSearch` keeps the applied coupon. */
export default function OrderItemsCard({ lines, cartSearch }) {
  return (
    <Card title="Your everyday essentials">
      <ul className={styles.lines}>
        {lines.map((line) => (
          <li key={line.productCode} className={styles.line}>
            <div>
              <p className={styles.name}>{line.name}</p>
              <p className={styles.meta}>
                {line.unit} · Qty {line.quantity}
              </p>
            </div>
            <p className={styles.amount}>{formatINR(line.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <Link to={{ pathname: paths.cart, search: cartSearch }} className={styles.edit}>
        Edit cart <Icon name="arrow-right" />
      </Link>
    </Card>
  )
}
