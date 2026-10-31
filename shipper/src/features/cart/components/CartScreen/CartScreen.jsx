import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { STOREFRONT } from '@/app/config/storefront'
import {
  itemRemoved,
  quantityChanged,
  savedForLaterToggled,
  selectActiveCartItems,
  selectDeliveryLocation,
  selectIsAuthenticated,
  selectSavedForLaterItems,
} from '@/app/store'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { getErrorMessage } from '@/app/services'
import CartLineItem from '@/features/cart/components/CartLineItem'
import CouponCard from '@/features/cart/components/CouponCard'
import DeliveryEstimate from '@/features/cart/components/DeliveryEstimate'
import OrderSummaryCard from '@/features/cart/components/OrderSummaryCard'
import SavedForLater from '@/features/cart/components/SavedForLater'
import { useCartQuote } from '@/features/cart/hooks/useCartQuote'
import { couponSearch, useCouponCode } from '@/features/cart/hooks/useCouponCode'
import { lineHasStockProblem } from '@/features/cart/lib/lineStock'
import { formatINR, pluralize } from '@/lib/format'
import CartSkeleton from './CartSkeleton'
import styles from './CartScreen.module.scss'

const BREADCRUMBS = [{ label: 'Home', to: paths.home }, { label: 'Your cart' }]

/**
 * The cart: lines, saved-for-later items, coupon and the order summary. The customer's choices (which
 * products, how many, saved or not) live in the cart store; every price, tax, shipping and wallet figure
 * on screen comes from the backend quote for those lines.
 */
export default function CartScreen() {
  const dispatch = useDispatch()
  const activeItems = useSelector(selectActiveCartItems)
  const savedItems = useSelector(selectSavedForLaterItems)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const deliveryLocation = useSelector(selectDeliveryLocation)
  const [couponCode, setCouponCode] = useCouponCode()

  // The wallet is previewed for signed-in customers, as in the design; the backend skips it for a coupon.
  const quote = useCartQuote({ couponCode, useWallet: isAuthenticated, pin: deliveryLocation?.pin })
  const savedQuote = useCartQuote({ items: savedItems })

  const lineByCode = new Map([...(savedQuote.data?.lines ?? []), ...(quote.data?.lines ?? [])].map((line) => [line.productCode, line]))
  const lines = activeItems.map((item) => lineByCode.get(item.productCode)).filter(Boolean)
  const savedLines = savedItems.map((item) => lineByCode.get(item.productCode)).filter(Boolean)
  const quantityOf = new Map(activeItems.map((item) => [item.productCode, item.quantity]))

  const removeItem = (line) => {
    dispatch(itemRemoved(line.productCode))
    toast.success(`${line.name} removed from your cart.`)
  }

  const hasActiveItems = activeItems.length > 0
  const summary = quote.data?.summary
  const stockProblem = lines.some((line) => lineHasStockProblem(line, quantityOf.get(line.productCode)))
  const savedSection = savedLines.length > 0 && (
    <SavedForLater
      lines={savedLines}
      onMoveToCart={(productCode) => dispatch(savedForLaterToggled(productCode))}
      onRemove={(productCode) => dispatch(itemRemoved(productCode))}
    />
  )
  const checkoutSearch = couponSearch(quote.data?.coupon?.valid ? couponCode : '')

  let content
  if (!hasActiveItems) {
    content = (
      <Card padding="none">
        <EmptyState
          icon="bag"
          title="Your cart is empty"
          description="Add a few everyday essentials and they will show up here."
          action={
            <Button as={Link} to={paths.shop}>
              Start shopping
            </Button>
          }
        />
      </Card>
    )
  } else if (quote.isError && !quote.data) {
    content = <ErrorState title="We couldn’t load your cart" message={getErrorMessage(quote.error)} onRetry={quote.refetch} />
  } else if (!quote.data) {
    content = <CartSkeleton />
  } else {
    content = (
      <div className={styles.layout}>
        <div className={styles.main}>
          {summary.awayFromFreeShipping === null ? (
            <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
              Your order qualifies for free shipping.
            </p>
          ) : (
            <p className={styles.notice} role="status">
              You’re {formatINR(summary.awayFromFreeShipping)} away from free shipping. Keep the goodness coming.
            </p>
          )}

          <Card>
            <DeliveryEstimate delivery={quote.data.delivery} />
            <ul>
              {lines.map((line) => (
                <CartLineItem
                  key={line.productCode}
                  line={line}
                  quantity={quantityOf.get(line.productCode)}
                  onQuantityChange={(quantity) => dispatch(quantityChanged({ productCode: line.productCode, quantity }))}
                  onSaveForLater={() => dispatch(savedForLaterToggled(line.productCode))}
                  onRemove={() => removeItem(line)}
                />
              ))}
            </ul>
          </Card>

          {!stockProblem && (
            // ASSUMPTION — confirm with backend team: the backend reserves stock while a customer checks out;
            // this reassurance is shown only when the quote reports every line as available.
            <p className={`${styles.notice} ${styles.noticeSuccess}`}>
              <Icon name="check2" /> All {pluralize(summary.units, 'unit')} are reserved while you complete checkout.
            </p>
          )}

          {savedSection}

          <Button as={Link} to={paths.shop} variant="secondary" size="lg" leftIcon="arrow-left" className={styles.continue}>
            Continue shopping
          </Button>
        </div>

        <aside className={styles.aside} aria-label="Order summary and coupon">
          <OrderSummaryCard quote={quote.data} busy={quote.isFetching}>
            <Button
              as={Link}
              to={{ pathname: paths.checkout, search: checkoutSearch }}
              size="lg"
              leftIcon="lock"
              rightIcon="arrow-right"
              disabled={stockProblem}
              className={styles.checkout}
            >
              Continue to checkout
            </Button>
            {stockProblem && (
              <p className={styles.problem} role="alert">
                Update or remove the items marked above to continue.
              </p>
            )}
            <p className={styles.secure}>Secure payments by Razorpay. Prices include all applicable taxes.</p>
          </OrderSummaryCard>

          <CouponCard
            key={couponCode}
            code={couponCode}
            coupon={quote.data.coupon}
            applying={Boolean(couponCode) && quote.isPlaceholderData}
            onApply={setCouponCode}
            onRemove={() => setCouponCode('')}
          />

          <p className={styles.help}>
            Easy help when you need it: <a href={`mailto:${STOREFRONT.supportEmail}`}>{STOREFRONT.supportEmail}</a>
          </p>
        </aside>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <Breadcrumbs items={BREADCRUMBS} />
      <header className={styles.header}>
        <h1 className={styles.title}>{hasActiveItems ? 'A few good things in your cart' : 'Your cart'}</h1>
        {hasActiveItems && summary && (
          <p className={styles.subtitle}>
            {pluralize(summary.products, 'product')} · {pluralize(summary.units, 'unit')} · All prices inclusive of GST
          </p>
        )}
      </header>
      {content}
      {!hasActiveItems && <div className={styles.savedOnly}>{savedSection}</div>}
    </div>
  )
}
