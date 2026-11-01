import CheckoutFlow from '@/features/checkout/components/CheckoutFlow'
import styles from './CheckoutScreen.module.scss'

/** Page body for /checkout: the full-width backdrop (a soft grey behind the cards on small screens) around the flow. */
export default function CheckoutScreen() {
  return (
    <div className={styles.page}>
      <div className="sh-container">
        <CheckoutFlow />
      </div>
    </div>
  )
}
