import { formatINR, pluralize } from '@/lib/format'
import { formatDate, formatLongDate, formatShortDate, formatShortDateTime } from '@/lib/date'
import { getCustomerOrderStatus } from '@/features/orders/constants/orderStatus'

// Wording that depends on how far an order has got. Everything shown is taken from the order the backend
// returned; nothing here decides what an order costs or when it arrives.

const HEADLINES = {
  processing: 'We’re getting your order ready.',
  shipped: 'Your everyday goodness is on its way.',
  delivered: 'Your everyday goodness has arrived.',
  returned: 'Your return is complete.',
  cancelled: 'This order was cancelled.',
}

export function getOrderHeadline(status) {
  if (status === 'out_for_delivery') return 'Your everyday goodness is out for delivery.'
  return HEADLINES[getCustomerOrderStatus(status).stage] ?? HEADLINES.processing
}

const refundDestination = (refund) => (refund.to === 'wallet' ? 'wallet' : 'your original payment method')

/** The one-line status note on an order card: { text, tone: 'success' | 'danger' | 'muted' }. */
export function getOrderNote(order) {
  const { stage } = getCustomerOrderStatus(order.status)

  if (stage === 'shipped') {
    return { text: [`Expected ${formatShortDate(order.estimatedDelivery)}`, order.carrier].filter(Boolean).join(' · '), tone: 'success' }
  }
  if (stage === 'delivered') return { text: 'Delivered with care · Thank you for shopping with us', tone: 'success' }
  if (stage === 'returned' || stage === 'cancelled') {
    const refund = order.refund
    if (refund) return { text: `Refunded ${formatINR(refund.amount)} to ${refundDestination(refund)} · ${formatShortDate(refund.at)}`, tone: 'danger' }
    return { text: stage === 'returned' ? 'Return received' : 'Cancelled', tone: 'muted' }
  }
  return { text: `Preparing your order · Expected ${formatShortDate(order.estimatedDelivery)}`, tone: 'muted' }
}

/** The one-line item summary on an order card: "4 units · Haldi ×2, Shampoo ×1, Aloe Face Wash ×1". */
export function getItemsLine(order) {
  const names = order.items.map((item) => `${item.shortName ?? item.name} ×${item.quantity}`).join(', ')
  return `${pluralize(order.units, 'unit')} · ${names}`
}

/** The tinted card at the top of an order: { eyebrow, title, detail }. */
export function getOrderHero(order) {
  const { stage } = getCustomerOrderStatus(order.status)
  const update = order.shipment?.lastUpdate

  if (stage === 'delivered') {
    return { eyebrow: 'Delivered', title: formatLongDate(order.deliveredAt), detail: 'Delivered with care. Thank you for shopping with Shipper.' }
  }
  if (stage === 'returned' || stage === 'cancelled') {
    const refund = order.refund
    return {
      eyebrow: stage === 'returned' ? 'Returned' : 'Cancelled',
      title: stage === 'returned' ? 'This order was returned' : 'This order was cancelled',
      detail: refund
        ? `Refunded ${formatINR(refund.amount, { decimals: 2 })} to ${refundDestination(refund)} on ${formatDate(refund.at)}.`
        : stage === 'returned'
          ? 'Your return has been received.'
          : 'This order will not be shipped.',
    }
  }
  if (stage === 'shipped') {
    return {
      eyebrow: 'Estimated delivery',
      title: formatLongDate(order.estimatedDelivery),
      detail: update ? `Last update: ${formatShortDateTime(update.at)} · ${update.note}` : 'Your parcel has been handed to the carrier.',
    }
  }
  return {
    eyebrow: 'Estimated delivery',
    title: formatLongDate(order.estimatedDelivery),
    detail: 'We’ll share tracking details as soon as your order is dispatched.',
  }
}
