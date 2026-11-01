import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Thumbnail from '@/components/atoms/Thumbnail'
import QuantityStepper from '@/components/molecules/QuantityStepper'
import { formatINR } from '@/lib/format'
import styles from './CartLineItem.module.scss'

/** Stock note for a cart line, from the backend quote (`stockStatus`, `lowStockLeft`, `maxQuantity`). */
function StockBadge({ line, quantity }) {
  if (line.maxQuantity === 0) return <Badge tone="danger">Out of stock</Badge>
  if (quantity > line.maxQuantity) return <Badge tone="danger">Only {line.maxQuantity} available</Badge>
  if (line.stockStatus === 'low_stock') return <Badge tone="warning">Only {line.lowStockLeft} left</Badge>
  return <Badge tone="success">In stock</Badge>
}

/**
 * One cart row. `quantity` is the customer's choice (kept in the cart), the rest comes from the quote line.
 * The stepper stops at the backend `maxQuantity`; the backend still validates stock when the order is placed.
 */
export default function CartLineItem({ line, quantity, onQuantityChange, onSaveForLater, onRemove }) {
  const unavailable = line.maxQuantity === 0

  return (
    <li className={styles.item}>
      <Link to={paths.product(line.slug)} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <Thumbnail src={line.image} size={130} className={styles.thumb} />
      </Link>

      <div className={styles.info}>
        <h3 className={styles.name}>
          <Link to={paths.product(line.slug)}>{line.name}</Link>
        </h3>
        <p className={styles.meta}>
          {line.unit} · {line.productCode}
        </p>
        <StockBadge line={line} quantity={quantity} />

        <div className={styles.actions}>
          <Button variant="link" size="sm" onClick={onSaveForLater}>
            Save for later
          </Button>
          <button type="button" className={styles.remove} onClick={onRemove}>
            Remove<span className="visually-hidden"> {line.name}</span>
          </button>
        </div>
      </div>

      <div className={styles.pricing}>
        <div className={styles.price}>
          <p className={styles.total}>
            <span className="visually-hidden">Line total </span>
            {formatINR(line.lineTotal)}
          </p>
          <p className={styles.each}>{formatINR(line.unitPrice)} each</p>
        </div>

        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          max={Math.max(1, line.maxQuantity)}
          disabled={unavailable}
          label={`Quantity of ${line.name}`}
          className={styles.stepper}
        />
      </div>
    </li>
  )
}
