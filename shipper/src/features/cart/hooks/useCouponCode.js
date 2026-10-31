import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

const COUPON_PARAM = 'coupon'

/**
 * The coupon the customer applied, kept in the URL (`?coupon=HELLO10`) so it survives a refresh and the
 * login redirect between cart and checkout. The backend quote decides whether the code is valid.
 */
export function useCouponCode() {
  const [params, setParams] = useSearchParams()
  const code = (params.get(COUPON_PARAM) ?? '').trim().toUpperCase()

  const setCode = useCallback(
    (next) =>
      setParams(
        (current) => {
          const updated = new URLSearchParams(current)
          if (next) updated.set(COUPON_PARAM, next.trim().toUpperCase())
          else updated.delete(COUPON_PARAM)
          return updated
        },
        { replace: true },
      ),
    [setParams],
  )

  return [code, setCode]
}

/** Query string that carries a valid coupon to the next screen: `?coupon=HELLO10`, or '' without one. */
export const couponSearch = (code) => (code ? `?${COUPON_PARAM}=${encodeURIComponent(code)}` : '')
