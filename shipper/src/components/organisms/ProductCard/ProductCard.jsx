import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import PriceDisplay from '@/components/molecules/PriceDisplay'
import QuantityStepper from '@/components/molecules/QuantityStepper'
import { useAddToCart } from './useAddToCart'
import styles from './ProductCard.module.scss'
const STOCK_TONE = { in_stock: 'inStock', low_stock: 'lowStock', out_of_stock: 'soldOut' }
function stockLabel({ stockStatus, lowStockLeft }) {
  if (stockStatus === 'out_of_stock') return 'Out of stock'
  return stockStatus === 'low_stock' ? `Only ${lowStockLeft} left · incl. GST` : 'In stock · incl. GST'
}
/**
* Storefront product tile: picture, "Category · size", name, price, availability, quantity and the
* Add to Cart / Buy Now actions. `product` is a catalogue summary (see features/catalog services).
* Pass `onToggleSaved` (and `isSaved`) to show the heart; it is hidden otherwise.
*/
export default function ProductCard({ product, isSaved = false, onToggleSaved, className }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, buyNow } = useAddToCart()
  const soldOut = product.stockStatus === 'out_of_stock'
  const handleAdd = () => {
    addToCart(product, quantity)
    setQuantity(1)
  }
  return (
    <article className={clsx(styles.card, soldOut && styles.unavailable, className)}>
      <div className={styles.media}>
        <img src={product.image} alt={product.name} className={styles.image} loading="lazy" />
        {soldOut && (
          <Badge tone="neutral" className={styles.soldOutBadge}>
            Sold out
          </Badge>
        )}
        {onToggleSaved && (
          <button
            type="button"
            className={clsx(styles.save, isSaved && styles.saved)}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${product.name} from saved products` : `Save ${product.name}`}
            onClick={() => onToggleSaved(product.code)}
          >
            <Icon name={isSaved ? 'heart-fill' : 'heart'} />
          </button>
        )}
      </div>
      <p className={styles.meta}>
        {product.categoryLabel} · {product.unit}
      </p>
      <h3 className={styles.name}>
        <Link to={paths.product(product.slug)} className={styles.nameLink}>
          {product.name}
        </Link>
      </h3>
      <PriceDisplay
        className={styles.price}
        sellingPrice={product.sellingPrice}
        mrp={product.mrp}
        discountPercent={product.discountPercent}
      />
      <p className={clsx(styles.stock, styles[STOCK_TONE[product.stockStatus]])}>{stockLabel(product)}</p>
      <div className={styles.controls}>
        <div className={styles.quantity}>
          <span className={styles.quantityLabel}>Qty</span>
          <QuantityStepper
            size="sm"
            value={quantity}
            onChange={setQuantity}
            max={product.purchaseLimit}
            disabled={soldOut}
            label={`Quantity of ${product.name}`}
          />
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" disabled={soldOut} onClick={handleAdd}>
            Add to Cart
          </Button>
          <Button size="sm" disabled={soldOut} onClick={() => buyNow(product, quantity)}>
            Buy Now
          </Button>
        </div>
      </div>
    </article>
  )
}