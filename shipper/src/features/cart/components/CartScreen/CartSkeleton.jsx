import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import styles from './CartScreen.module.scss'

/** First-load placeholder with the same two-column shape as the loaded cart. */
export default function CartSkeleton() {
  return (
    <div className={styles.layout} role="status" aria-label="Loading your cart">
      <div className={styles.main}>
        <Skeleton height="3.25rem" radius="var(--sh-radius-lg)" />
        <Card>
          {[0, 1, 2].map((row) => (
            <div key={row} className={styles.skeletonRow}>
              <Skeleton width="130px" height="130px" radius="var(--sh-radius-lg)" />
              <div className={styles.skeletonText}>
                <Skeleton width="55%" height="1.25rem" />
                <Skeleton width="30%" />
                <Skeleton width="5rem" height="1.375rem" />
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className={styles.aside}>
        <Card>
          <Skeleton height="16rem" />
        </Card>
      </div>
    </div>
  )
}
