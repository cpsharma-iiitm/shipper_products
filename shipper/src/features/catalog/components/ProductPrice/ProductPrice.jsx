import Badge from '@/components/atoms/Badge'
import { formatINR, formatPercent } from '@/lib/format'
import styles from './ProductPrice.module.scss'

/**
 * Product-page price block: ₹120  MRP ₹150  20% OFF, then the tax and savings line. Every figure,
 * including the savings, is supplied by the backend.
 */
export default function ProductPrice({ product }) {
  return (
    <div>
      <div className={styles.row}>
        <span className={styles.selling}>{formatINR(product.sellingPrice)}</span>
        {product.mrp > product.sellingPrice && <span className={styles.mrp}>MRP {formatINR(product.mrp)}</span>}
        {product.discountPercent > 0 && (
          <Badge tone="success" className={styles.discount}>
            {formatPercent(product.discountPercent, { maximumFractionDigits: 0 })} off
          </Badge>
        )}
      </div>
      <p className={styles.note}>
        Inclusive of {formatPercent(product.gstPercent)} GST
        {product.savings > 0 && <> · You save {formatINR(product.savings)}</>}
      </p>
    </div>
  )
}
