import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import styles from './OrderDetailSkeleton.module.scss'

/** Placeholder with the same shape as OrderDetail while the order loads. */
export default function OrderDetailSkeleton() {
  return (
    <div className={styles.layout} aria-busy="true" aria-label="Loading your order">
      <Skeleton height="7.5rem" radius="0.75rem" className={styles.hero} />
      <Card padding="md" aria-hidden="true">
        <Skeleton width="10rem" height="1.25rem" />
        <div className={styles.lines}>
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} height="1rem" width={key % 2 ? '70%' : '85%'} />
          ))}
        </div>
      </Card>
      <Card padding="md" aria-hidden="true">
        <Skeleton width="10rem" height="1.25rem" />
        <div className={styles.lines}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} height="4.75rem" radius="0.5rem" />
          ))}
        </div>
      </Card>
    </div>
  )
}
