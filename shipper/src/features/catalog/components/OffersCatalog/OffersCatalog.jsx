import { useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Skeleton from '@/components/atoms/Skeleton'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { Pagination } from '@/components/molecules/Pagination'
import CouponCard from '@/features/catalog/components/CouponCard'
import FreeShippingNote from '@/features/catalog/components/FreeShippingNote'
import ProductGrid from '@/features/catalog/components/ProductGrid'
import ResultsSummary from '@/features/catalog/components/ResultsSummary'
import { useOffers, useProducts } from '@/features/catalog/hooks/useCatalog'
import { useSaveProduct } from '@/features/catalog/hooks/useSaveProduct'
import styles from './OffersCatalog.module.scss'

const DEALS_PAGE_SIZE = 8
const DEALS_MIN_DISCOUNT = 20
const COUPON_TONES = ['primary', 'sand']

function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')))
  return Number.isFinite(page) && page > 0 ? page : 1
}

/** /offers — coupons, the free-delivery rule and the best-discounted products (catalogue API, `minDiscount`, biggest discount first). */
export default function OffersCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = readPage(searchParams)
  const dealsRef = useRef(null)
  const offers = useOffers()
  const deals = useProducts(
    { minDiscount: DEALS_MIN_DISCOUNT, sort: 'discount', page, pageSize: DEALS_PAGE_SIZE },
    { keepPrevious: true },
  )
  const save = useSaveProduct()

  const goToPage = (nextPage) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (nextPage > 1) next.set('page', String(nextPage))
      else next.delete('page')
      return next
    })
    dealsRef.current?.scrollIntoView({ block: 'start' })
  }

  let coupons
  if (offers.isError) {
    coupons = <ErrorState compact message={getErrorMessage(offers.error)} onRetry={offers.refetch} />
  } else if (offers.isPending) {
    coupons = (
      <div className={styles.coupons} aria-busy="true">
        <Skeleton height="13.5rem" radius="var(--sh-radius-lg)" />
        <Skeleton height="13.5rem" radius="var(--sh-radius-lg)" />
      </div>
    )
  } else {
    coupons = (
      <ul className={styles.coupons}>
        {offers.data.coupons.map((coupon, index) => (
          <li key={coupon.code}>
            <CouponCard coupon={coupon} tone={COUPON_TONES[index % COUPON_TONES.length]} />
          </li>
        ))}
      </ul>
    )
  }

  const { data } = deals
  let results
  if (deals.isError) {
    results = <ErrorState message={getErrorMessage(deals.error)} onRetry={deals.refetch} />
  } else if (deals.isPending) {
    results = <ProductGrid variant="shelf" loading skeletonCount={DEALS_PAGE_SIZE} />
  } else if (data.items.length === 0) {
    results = (
      <EmptyState
        icon="tag"
        title="No deals right now"
        description="Check back soon, or browse everything we have."
        action={
          <Button as={Link} to={paths.shop}>
            Shop all products
          </Button>
        }
      />
    )
  } else {
    results = (
      <ProductGrid
        variant="shelf"
        label="Discounted products"
        products={data.items}
        isSaved={save.isSaved}
        onToggleSaved={save.onToggleSaved}
      />
    )
  }

  return (
    <div className={clsx('sh-container', styles.page)}>
      <header className={styles.intro}>
        <Breadcrumbs
          className={styles.breadcrumbs}
          items={[{ label: 'Home', to: paths.home }, { label: 'Today’s offers' }]}
        />
        <h1 className={styles.title}>Today’s offers</h1>
        <p className={styles.description}>Coupons, free delivery and the best prices on everyday essentials.</p>
      </header>

      <section className={styles.section} aria-labelledby="coupons-title">
        <h2 id="coupons-title" className={styles.sectionTitle}>
          Coupons for you
        </h2>
        {coupons}
      </section>

      {offers.data && (
        <div className={styles.section}>
          <FreeShippingNote threshold={offers.data.freeShippingThreshold} />
        </div>
      )}

      <section ref={dealsRef} className={styles.section} aria-labelledby="deals-title">
        <h2 id="deals-title" className={styles.sectionTitle}>
          Best prices right now
        </h2>
        <p className={styles.sectionDescription}>Products with {DEALS_MIN_DISCOUNT}% off or more, biggest savings first.</p>

        <div
          className={clsx(styles.deals, deals.isPlaceholderData && styles.refreshing)}
          aria-busy={deals.isFetching || undefined}
        >
          {results}
        </div>

        {data && data.pageCount > 1 && (
          <div className={styles.footer}>
            <ResultsSummary page={data.page} pageSize={data.pageSize} totalItems={data.totalItems} />
            <Pagination page={data.page} pageCount={data.pageCount} onPageChange={goToPage} />
          </div>
        )}
      </section>
    </div>
  )
}
