import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import ErrorState from '@/components/molecules/ErrorState'
import ProductGrid from '@/features/catalog/components/ProductGrid'
import SectionHeader from '@/features/catalog/components/SectionHeader'
import { useProducts } from '@/features/catalog/hooks/useCatalog'
import styles from './ProductShelf.module.scss'

const SHELF_SIZE = 4

/**
 * A titled row of curated products from the catalogue API (`collection`). `compactCodes` are the
 * products phones show, `action` is the desktop button and `phoneActionLabel` the phone link (`null` hides it).
 */
export default function ProductShelf({ id, title, description, collection, compactCodes, action, phoneActionLabel = 'View all', className }) {
  const { data, isPending, isError, error, refetch } = useProducts({ collection, pageSize: SHELF_SIZE })

  return (
    <section className={clsx('sh-container', styles.section, className)} aria-labelledby={id}>
      <SectionHeader
        id={id}
        title={title}
        description={description}
        action={
          <>
            <Button as={Link} to={action.to} size="lg" rightIcon="arrow-right" className="d-none d-md-inline-flex">
              {action.label}
            </Button>
            {phoneActionLabel && (
              <Link to={action.to} className={styles.phoneAction}>
                {phoneActionLabel} <Icon name="arrow-right" />
              </Link>
            )}
          </>
        }
      />
      <div className={styles.grid}>
        {isError ? (
          <ErrorState compact message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <ProductGrid
            variant="shelf"
            products={data?.items ?? []}
            loading={isPending}
            skeletonCount={SHELF_SIZE}
            compactCodes={compactCodes}
          />
        )}
      </div>
    </section>
  )
}
