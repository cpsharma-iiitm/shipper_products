import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { itemAdded } from '@/app/store'

/**
 * Cart intent for product tiles and the product page. Prices and totals come from the backend quote,
 * so only the product code and quantity are stored.
 *   addToCart(product, quantity)  adds the line and confirms with a toast
 *   buyNow(product, quantity)     adds the line and opens checkout (signed-out visitors are sent to login by the route guard)
 */
export function useAddToCart() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const addToCart = useCallback(
        (product, quantity = 1) => {
            dispatch(itemAdded({ productCode: product.code, quantity }))
            toast.success(quantity > 1 ? `${quantity} × ${product.name} added to your cart.` : `${product.name} added to your cart.`)
        },
        [dispatch],
    )

    const buyNow = useCallback(
        (product, quantity = 1) => {
            dispatch(itemAdded({ productCode: product.code, quantity }))
            navigate(paths.checkout)
        },
        [dispatch, navigate],
    )

    return { addToCart, buyNow }
}