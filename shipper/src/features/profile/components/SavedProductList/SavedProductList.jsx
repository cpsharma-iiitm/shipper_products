import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import { itemAdded } from '@/app/store'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import StatusBadge from '@/components/atoms/StatusBadge'
import Thumbnail from '@/components/atoms/Thumbnail'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PriceDisplay from '@/components/molecules/PriceDisplay'
import { useSavedProducts, useSavedProductToggle } from '@/features/saved'
import styles from './SavedProductList.module.scss'

function SavedProductSkeleton() {
  return (
    <li className={styles.item} aria-hidden="true">
      <Skeleton width="6rem" height="6rem" radius="0.75rem" />
      <div className={styles.skeletonText}>
        <Skeleton width="55%" height="1.125rem" />
        <Skeleton width="30%" height="0.875rem" />
        <Skeleton width="25%" height="1.25rem" />
      </div>
    </li>
  )
}

/**
 * "Saved products": the customer's saved list with a picture, price, stock state, Add to cart and Remove.
 * Prices come from the backend's saved-product summaries; adding to the cart only records the product and
 * quantity, the cart asks the backend for the price.
 */
export default function SavedProductList() {
  const dispatch = useDispatch()
  const saved = useSavedProducts()
  const { toggle } = useSavedProductToggle()

  const addToCart = (product) => {
    dispatch(itemAdded({ productCode: product.productCode, quantity: 1 }))
    toast.success(`${product.name} added to your cart.`)
  }

  const remove = (product) => {
    toggle(product.productCode)
    toast.info(`${product.name} removed from saved products.`)
  }

  if (saved.isError) {
    return <ErrorState title="We couldn’t load your saved products" message={getErrorMessage(saved.error)} onRetry={saved.refetch} />
  }

  if (saved.isSuccess && saved.data.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Nothing saved yet"
        description="Tap the heart on any product to keep it here for later."
        action={
          <Button as={Link} to={paths.shop}>
            Shop everyday essentials
          </Button>
        }
      />
    )
  }

  return (
    <Card padding="none" aria-label="Saved products" aria-busy={saved.isPending || undefined}>
      <ul className={styles.list}>
        {saved.isPending
          ? [0, 1, 2].map((key) => <SavedProductSkeleton key={key} />)
          : saved.data.map((product) => {
              const unavailable = product.stockStatus === 'out_of_stock'
              return (
                <li key={product.productCode} className={styles.item}>
                  <Link to={paths.product(product.slug)} tabIndex={-1} aria-hidden="true">
                    <Thumbnail src={product.image} size={96} />
                  </Link>
                  <div className={styles.info}>
                    <Link to={paths.product(product.slug)} className={styles.name}>
                      {product.name}
                    </Link>
                    <p className={styles.meta}>
                      {product.unit} · {product.categoryLabel}
                    </p>
                    <div className={styles.priceRow}>
                      <PriceDisplay sellingPrice={product.sellingPrice} mrp={product.mrp} discountPercent={product.discountPercent} />
                      {product.stockStatus !== 'in_stock' && <StatusBadge status={product.stockStatus} />}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Button size="sm" leftIcon="bag-plus" disabled={unavailable} onClick={() => addToCart(product)}>
                      Add to cart
                    </Button>
                    <Button variant="secondary" size="sm" leftIcon="heart-fill" onClick={() => remove(product)}>
                      Remove<span className="visually-hidden"> {product.name} from saved products</span>
                    </Button>
                  </div>
                </li>
              )
            })}
      </ul>
    </Card>
  )
}
