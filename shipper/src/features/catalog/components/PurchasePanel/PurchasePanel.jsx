import { useState } from 'react'
import clsx from 'clsx'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import QuantityStepper from '@/components/molecules/QuantityStepper'
import { useAddToCart } from '@/components/organisms/ProductCard/useAddToCart'
import { useSaveProduct } from '@/features/catalog/hooks/useSaveProduct'
import { formatNumber } from '@/lib/format'
import styles from './PurchasePanel.module.scss'

const STOCK_BADGE = {
  in_stock: { tone: 'success', label: (product) => `In stock · ${formatNumber(product.availableQuantity)} available` },
  low_stock: { tone: 'warning', label: (product) => `Only ${product.lowStockLeft} left` },
  out_of_stock: { tone: 'danger', label: () => 'Out of stock' },
}

/** Availability, quantity, Add to Cart, Buy Now and the save heart for one product. */
export default function PurchasePanel({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, buyNow } = useAddToCart()
  const { isSaved, onToggleSaved } = useSaveProduct()
  const stock = STOCK_BADGE[product.stockStatus]
  const soldOut = product.stockStatus === 'out_of_stock'
  const saved = isSaved(product.code)

  return (
    <div className={styles.panel}>
      <div className={styles.stockRow}>
        <Badge tone={stock.tone} className={styles.stock}>
          {stock.label(product)}
        </Badge>
        <div className={styles.quantity}>
          <span className={styles.quantityLabel}>Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={product.purchaseLimit} disabled={soldOut} />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="lg" leftIcon="bag" disabled={soldOut} onClick={() => addToCart(product, quantity)}>
          Add to Cart
        </Button>
        <Button size="lg" rightIcon="arrow-right" disabled={soldOut} onClick={() => buyNow(product, quantity)}>
          Buy Now
        </Button>
        <button
          type="button"
          className={clsx(styles.save, saved && styles.saved)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved products' : 'Save for later'}
          onClick={() => onToggleSaved(product.code)}
        >
          <Icon name={saved ? 'heart-fill' : 'heart'} />
        </button>
      </div>
    </div>
  )
}
