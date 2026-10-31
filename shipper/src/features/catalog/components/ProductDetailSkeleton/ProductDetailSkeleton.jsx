import Skeleton from '@/components/atoms/Skeleton'
import styles from './ProductDetailSkeleton.module.scss'

/** Placeholder with the product page's proportions while the product loads. */
export default function ProductDetailSkeleton() {
  return (
    <div className={styles.layout} role="status" aria-label="Loading product">
      <Skeleton height="auto" radius="var(--sh-radius-lg)" className={styles.image} />
      <div className={styles.info}>
        <Skeleton width="9rem" height="1.5rem" />
        <Skeleton width="70%" height="2.5rem" />
        <Skeleton width="50%" height="1.25rem" />
        <Skeleton width="35%" height="1rem" />
        <Skeleton width="45%" height="2.5rem" />
        <Skeleton height="4rem" />
        <Skeleton width="60%" height="2.75rem" />
      </div>
    </div>
  )
}
