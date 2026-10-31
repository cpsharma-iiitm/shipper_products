import Icon from '@/components/atoms/Icon'
import { formatINR } from '@/lib/format'
import styles from './FreeShippingNote.module.scss'

/** Free-delivery rule from the offers API. The delivery charge on a smaller order is shown at checkout. */
export default function FreeShippingNote({ threshold }) {
  return (
    <section className={styles.note} aria-labelledby="free-shipping-title">
      <span className={styles.icon}>
        <Icon name="truck" />
      </span>
      <div>
        <h2 id="free-shipping-title" className={styles.title}>
          Free delivery on orders of {formatINR(threshold)} and above
        </h2>
        <p className={styles.description}>Smaller orders show their delivery charge before you pay.</p>
      </div>
    </section>
  )
}
