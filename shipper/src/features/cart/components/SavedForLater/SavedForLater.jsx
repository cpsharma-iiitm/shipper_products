import { useId } from 'react'
import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Thumbnail from '@/components/atoms/Thumbnail'
import { formatINR } from '@/lib/format'
import styles from './SavedForLater.module.scss'

/** Products set aside from the cart. `lines` are quote lines for those products. */
export default function SavedForLater({ lines, onMoveToCart, onRemove }) {
  const headingId = useId()

  return (
    <Card as="section" aria-labelledby={headingId} className={styles.card}>
      <h2 id={headingId} className={styles.title}>
        Saved for later ({lines.length})
      </h2>
      <ul>
        {lines.map((line) => {
          const unavailable = line.maxQuantity === 0
          return (
            <li key={line.productCode} className={styles.item}>
              <Thumbnail src={line.image} size={64} className={styles.thumb} />
              <div className={styles.info}>
                <h3 className={styles.name}>
                  <Link to={paths.product(line.slug)}>{line.name}</Link>
                </h3>
                <p className={styles.meta}>
                  {line.unit} · {line.productCode} · {formatINR(line.unitPrice)}
                </p>
                {unavailable && <Badge tone="danger">Out of stock</Badge>}
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" size="sm" disabled={unavailable} onClick={() => onMoveToCart(line.productCode)}>
                  Move to cart<span className="visually-hidden"> {line.name}</span>
                </Button>
                <button type="button" className={styles.remove} onClick={() => onRemove(line.productCode)}>
                  Remove<span className="visually-hidden"> {line.name} from saved items</span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
