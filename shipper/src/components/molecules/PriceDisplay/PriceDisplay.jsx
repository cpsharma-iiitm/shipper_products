import clsx from 'clsx'
import { formatINR, formatPercent, toNumber } from '@/lib/format'
import styles from './PriceDisplay.module.scss'

/**
 * Selling price, struck-through MRP and discount badge. Every figure is backend-supplied; nothing
 * is calculated here. The MRP is shown only when it differs from the selling price and the badge
 * only when `discountPercent` is provided.
 *
 * size: md (cards, cart lines) | lg (product page)
 * `mrpLabel="MRP"` and `uppercaseDiscount` reproduce the product-page treatment: ₹120 MRP ₹150 20% OFF.
 */
export default function PriceDisplay({
  sellingPrice,
  mrp,
  discountPercent,
  size = 'md',
  mrpLabel,
  uppercaseDiscount = false,
  className,
}) {
  const selling = toNumber(sellingPrice)
  const maxRetail = toNumber(mrp)
  const discount = toNumber(discountPercent)
  const showMrp = maxRetail !== null && selling !== null && maxRetail > selling

  return (
    <div className={clsx(styles.price, styles[size], className)}>
      <span className={styles.selling}>{formatINR(sellingPrice)}</span>
      {showMrp && (
        <span className={styles.mrp}>
          {mrpLabel && <span>{mrpLabel} </span>}
          <s>
            <span className="visually-hidden">Original price </span>
            {formatINR(mrp)}
          </s>
        </span>
      )}
      {discount !== null && discount > 0 && (
        <span className={clsx(styles.discount, uppercaseDiscount && styles.uppercase)}>
          {formatPercent(discount, { maximumFractionDigits: 0 })} off
        </span>
      )}
    </div>
  )
}