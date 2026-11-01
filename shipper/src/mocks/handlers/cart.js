import { defineHandler } from '@/mocks/adapter'
import { db, getProduct, ordersOfCustomer } from '@/mocks/db'
import { fromNow } from '@/mocks/fixtures/clock'
import { SERVICEABLE_PINS, SHIPPING_METHOD } from '@/mocks/fixtures/serviceability'
import { getRequestUser } from '@/mocks/lib/auth'
import { computeQuote } from '@/mocks/lib/quote'
 
/**
 * POST /cart/quote — the single source of every figure shown in the cart and checkout summary.
 * Body: { items: [{ productCode, quantity }], couponCode?, useWallet?, pin?, addressId? }
 * ASSUMPTION — confirm with backend team (B-01, B-03, B-04): request and response shape.
 */
export const cartHandlers = [
  defineHandler('post', '/cart/quote', ({ body, headers }) => {
    const user = getRequestUser(headers)
    const customer = user?.role === 'customer' ? db.customers.find((entry) => entry.id === user.id) : null
 
    const address = customer && body?.addressId ? (db.addresses[customer.id] ?? []).find((entry) => entry.id === body.addressId) : null
    const pin = address?.pin ?? body?.pin ?? null
    const area = pin ? SERVICEABLE_PINS[pin] : null
 
    const lines = (body?.items ?? [])
      .map((item) => ({ product: getProduct(item.productCode), quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1) }))
      .filter((line) => line.product)
 
    const quote = computeQuote({
      lines,
      destinationState: address?.state ?? area?.state,
      useWallet: Boolean(body?.useWallet),
      walletBalance: customer?.walletBalance ?? 0,
      couponCode: body?.couponCode || undefined,
      hasPriorOrders: customer ? ordersOfCustomer(customer.id).length > 0 : false,
    })
 
    return {
      data: {
        ...quote,
        lines: quote.lines.map((line) => {
          const product = getProduct(line.productCode)
          return { ...line, categoryLabel: product.categoryLabel, image: product.thumbnail }
        }),
        delivery: {
          pin,
          serviceable: pin ? Boolean(area) : null,
          city: area?.city ?? null,
          method: SHIPPING_METHOD,
          fee: quote.summary.shipping,
          etaFrom: area ? fromNow({ days: area.etaMinDays }) : null,
          etaTo: area ? fromNow({ days: area.etaMaxDays }) : null,
        },
      },
    }
  }),
]
