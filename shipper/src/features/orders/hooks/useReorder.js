import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { itemAdded } from '@/app/store'
import { pluralize } from '@/lib/format'

/**
 * Puts the lines of a past order back into the cart and opens it. Pass `[{ productCode, quantity, available? }]`;
 * lines the backend marked unavailable are skipped and the customer is told. Prices are never carried over:
 * the cart asks the backend for a fresh quote.
 */
export function useReorder() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useCallback(
    (lines) => {
      const available = lines.filter((line) => line.available !== false)
      const skipped = lines.length - available.length

      if (available.length === 0) {
        toast.error('These items are not available right now.')
        return
      }
      available.forEach(({ productCode, quantity }) => dispatch(itemAdded({ productCode, quantity })))
      const units = available.reduce((total, line) => total + line.quantity, 0)
      toast.success(
        skipped > 0
          ? `${pluralize(units, 'item')} added to your cart. ${pluralize(skipped, 'product')} could not be added because it is unavailable.`
          : `${pluralize(units, 'item')} added to your cart.`,
      )
      navigate(paths.cart)
    },
    [dispatch, navigate],
  )
}
