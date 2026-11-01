import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import { formatINR } from '@/lib/format'
import styles from './VariantPicker.module.scss'

/** Pack sizes of the same product ("200 g · ₹120"); each is its own product page. */
export default function VariantPicker({ variants }) {
  if (variants.length < 2) return null

  return (
    <nav aria-label="Pack size">
      <ul className={styles.list}>
        {variants.map((variant) => (
          <li key={variant.code}>
            <Link
              to={paths.product(variant.slug)}
              className={clsx(styles.option, variant.isCurrent && styles.current, variant.stockStatus === 'out_of_stock' && styles.soldOut)}
              aria-current={variant.isCurrent ? 'true' : undefined}
            >
              {variant.unit} · {formatINR(variant.sellingPrice)}
              {variant.stockStatus === 'out_of_stock' && <span className="visually-hidden"> (out of stock)</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
