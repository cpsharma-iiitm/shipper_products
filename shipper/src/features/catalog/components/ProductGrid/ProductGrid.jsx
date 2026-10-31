import clsx from 'clsx'
import Skeleton from '@/components/atoms/Skeleton'
import ProductCard from '@/components/organisms/ProductCard'
import styles from './ProductGrid.module.scss'

function ProductCardSkeleton() {
  return (
    <li className={styles.skeletonCard} aria-hidden="true">
      <Skeleton height="var(--card-image-height)" radius="var(--sh-radius-md)" />
      <Skeleton width="40%" height="0.75rem" />
      <Skeleton width="80%" height="1.125rem" />
      <Skeleton width="55%" height="1.5rem" className={styles.skeletonPrice} />
      <Skeleton width="45%" height="0.75rem" />
      <Skeleton width="50%" height="2.125rem" />
    </li>
  )
}

/**
 * Responsive grid of product cards. variant: listing (shop and offers, beside the filter panel: 2 / 3 columns)
 * | shelf (home, offers and related products: 2 / 4 columns, the fourth from 1024px). `compactCodes` limits phones to those products, as the
 * home artboard shows two per shelf. Pass `onToggleSaved` (from useSaveProduct) with `isSaved` to add the heart.
 */
export default function ProductGrid({
  products,
  variant = 'listing',
  compactCodes,
  isSaved,
  onToggleSaved,
  loading = false,
  skeletonCount = 4,
  label,
}) {
  return (
    <ul className={clsx(styles.grid, styles[variant])} aria-label={label} aria-busy={loading || undefined}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => <ProductCardSkeleton key={index} />)
        : products.map((product) => (
            <li key={product.code} className={clsx(compactCodes && !compactCodes.includes(product.code) && styles.desktopOnly)}>
              <ProductCard
                product={product}
                isSaved={isSaved?.(product.code)}
                onToggleSaved={onToggleSaved}
                className={styles.card}
              />
            </li>
          ))}
    </ul>
  )
}
