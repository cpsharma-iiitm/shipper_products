import Card from '@/components/atoms/Card'
import { formatPercent } from '@/lib/format'
import styles from './ProductDetailsCard.module.scss'

/** "The details" table: what is in the pack, batch, tax and storage. */
export default function ProductDetailsCard({ product, className }) {
  const rows = [
    ['Product code', product.code],
    ['Ingredients', product.ingredients],
    ['Net quantity', product.netQuantity],
    ['Batch / best before', `${product.batch} / ${product.bestBefore}`],
    ['HSN / GST', `${product.hsn} / ${formatPercent(product.gstPercent)}`],
    ['Storage', product.storage],
  ]

  return (
    <Card title="The details" className={className}>
      <dl className={styles.rows}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>
        Packed by {product.packedBy}. {product.careNote}
      </p>
    </Card>
  )
}
