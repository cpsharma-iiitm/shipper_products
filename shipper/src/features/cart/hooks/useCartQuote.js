import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectActiveCartItems } from '@/app/store'
import { getCartQuote } from '@/features/cart/services/cartService'

export const cartKeys = {
  all: ['cart'],
  quote: (payload) => ['cart', 'quote', payload],
}

/**
 * Backend quote for the active (not saved-for-later) cart lines. Pass `couponCode`, `useWallet`, `pin`
 * or `addressId` to price the checkout; `items` overrides the cart lines (for example "Buy now").
 * The previous quote stays on screen while a new one loads so totals do not flicker.
 */
export function useCartQuote({ items, couponCode, useWallet = false, pin, addressId, enabled = true } = {}) {
  const cartItems = useSelector(selectActiveCartItems)
  const lines = (items ?? cartItems).map(({ productCode, quantity }) => ({ productCode, quantity }))
  const payload = { items: lines, couponCode: couponCode || undefined, useWallet, pin: pin || undefined, addressId: addressId || undefined }

  return useQuery({
    queryKey: cartKeys.quote(payload),
    queryFn: () => getCartQuote(payload),
    enabled: enabled && lines.length > 0,
    placeholderData: keepPreviousData,
  })
}
