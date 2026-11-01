import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { itemRemoved } from '@/app/store'
import { cartKeys } from '@/features/cart'
import { placeOrder } from '@/features/checkout/services/checkoutService'
import { payForOrder } from '@/features/checkout/services/paymentService'

// ASSUMPTION — confirm with the orders/wallet owners: these are the root keys of their query keys. A placed
// order changes the order history and, when the wallet was used, the wallet balance and ledger.
const ORDER_QUERY_ROOT = ['orders']
const WALLET_QUERY_ROOT = ['wallet']

/**
 * Place the order and pay for it: POST the order, open a payment session, collect the payment, confirm it.
 * Variables: { order, payment } where `order` is the checkout payload and `payment` the options for the
 * payment window. After a payment the purchased lines leave the cart (saved-for-later items stay) and the
 * customer lands on the confirmation page.
 *
 * An order whose payment failed stays unpaid on the backend; paying again with the same checkout payload
 * re-uses it instead of placing a duplicate.
 */
export function useCheckoutPayment() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const unpaidOrder = useRef(null) // { payloadKey, orderNumber }

  return useMutation({
    mutationFn: async ({ order, payment }) => {
      const payloadKey = JSON.stringify(order)
      let orderNumber = unpaidOrder.current?.payloadKey === payloadKey ? unpaidOrder.current.orderNumber : null

      if (!orderNumber) {
        const placed = await placeOrder(order)
        orderNumber = placed.orderNumber
        unpaidOrder.current = { payloadKey, orderNumber }
        // Fully covered by the wallet: nothing left to collect.
        if (placed.paymentStatus === 'paid') return { orderNumber }
      }

      await payForOrder(orderNumber, payment)
      return { orderNumber }
    },
    onSuccess: ({ orderNumber }, { order }) => {
      unpaidOrder.current = null
      order.items.forEach(({ productCode }) => dispatch(itemRemoved(productCode)))
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_ROOT })
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_ROOT })
      navigate(paths.orderConfirmation(orderNumber), { replace: true })
    },
    onError: (error) => {
      // 409: the backend's prices or stock moved on; show the customer the current quote.
      if (error.status === 409) queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
