import ProductGrid from '@/features/catalog/components/ProductGrid'
import { useRelatedProducts } from '@/features/catalog/hooks/useCatalog'
import styles from './RelatedProducts.module.scss'

/** "A few more good things": complementary products for the one being viewed. Hidden when there are none. */
export default function RelatedProducts({ slug }) {
  const related = useRelatedProducts(slug)

  if (related.isError || (related.isSuccess && related.data.length === 0)) return null

  return (
    <section className={styles.section} aria-labelledby="related-heading">
      <h2 id="related-heading" className={styles.title}>
        A few more good things
      </h2>
      <p className={styles.description}>Complete your everyday essentials.</p>
      <div className={styles.grid}>
        <ProductGrid variant="shelf" products={related.data ?? []} loading={related.isPending} skeletonCount={4} />
      </div>
    </section>
  )
}
