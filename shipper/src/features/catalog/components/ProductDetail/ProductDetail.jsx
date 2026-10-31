import clsx from 'clsx'
import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import ErrorState from '@/components/molecules/ErrorState'
import RatingStars from '@/components/molecules/RatingStars'
import ProductDetailsCard from '@/features/catalog/components/ProductDetailsCard'
import ProductDetailSkeleton from '@/features/catalog/components/ProductDetailSkeleton'
import ProductGallery from '@/features/catalog/components/ProductGallery'
import ProductNotFound from '@/features/catalog/components/ProductNotFound'
import ProductPrice from '@/features/catalog/components/ProductPrice'
import PurchasePanel from '@/features/catalog/components/PurchasePanel'
import RelatedProducts from '@/features/catalog/components/RelatedProducts'
import ReviewsCard from '@/features/catalog/components/ReviewsCard'
import VariantPicker from '@/features/catalog/components/VariantPicker'
import { useProduct } from '@/features/catalog/hooks/useCatalog'
import DeliveryCheck from '@/features/storefront/components/DeliveryCheck'
import { formatNumber } from '@/lib/format'
import styles from './ProductDetail.module.scss'

function ProductView({ product }) {
  return (
    <div className={clsx('sh-container', styles.page)}>
      <Breadcrumbs
        className={styles.breadcrumbs}
        items={[{ label: 'Home', to: paths.home }, { label: product.categoryLabel, to: paths.category(product.category) }, { label: product.name }]}
      />

      <div className={styles.layout}>
        <ProductGallery images={product.gallery} name={product.name} />

        <div className={styles.summary}>
          {product.badge && (
            <Badge tone="info" className={styles.badge}>
              {product.badge}
            </Badge>
          )}
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.rating}>
            <RatingStars value={Math.round(product.rating)} tone="warning" />
            <span>{product.rating.toFixed(1)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatNumber(product.reviewCount)} verified reviews</span>
          </p>

          <ProductPrice product={product} />
          <p className={styles.description}>{product.description}</p>

          <VariantPicker variants={product.variants} />
          <PurchasePanel product={product} />
          <DeliveryCheck className={styles.delivery} />
          <p className={styles.assurance}>Secure payments · Quality checked · India-wide shipping</p>
        </div>
      </div>

      <div className={styles.info}>
        <ProductDetailsCard product={product} />
        <ReviewsCard reviews={product.reviews} />
      </div>

      <RelatedProducts slug={product.slug} />
    </div>
  )
}

/** Product page for a slug: gallery, price, purchase actions, delivery check, details, reviews and related products. */
export default function ProductDetail({ slug }) {
  const { data: product, isPending, isError, error, refetch } = useProduct(slug)

  if (isPending) {
    return (
      <div className={clsx('sh-container', styles.page)}>
        <ProductDetailSkeleton />
      </div>
    )
  }
  if (isError) {
    return error.status === 404 ? (
      <ProductNotFound />
    ) : (
      <div className="sh-container py-5">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    )
  }

  return <ProductView key={product.slug} product={product} />
}
