import { STATUS_META } from '@/app/config/statuses'

const ORDER_STATUSES = ['new', 'to_pick', 'to_pack', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled']
const PAYMENT_STATUSES = ['paid', 'pending', 'failed', 'refunded']

/** "All" plus every order status, in lifecycle order, labelled from the shared status vocabulary. */
export const ORDER_STATUS_OPTIONS = [{ value: '', label: 'All' }, ...ORDER_STATUSES.map((value) => ({ value, label: STATUS_META[value].label }))]

export const PAYMENT_STATUS_OPTIONS = [{ value: '', label: 'All' }, ...PAYMENT_STATUSES.map((value) => ({ value, label: STATUS_META[value].label }))]

export const CANCEL_REASON_OPTIONS = [
  { value: 'customer_request', label: 'Customer asked to cancel' },
  { value: 'payment_issue', label: 'Payment problem' },
  { value: 'out_of_stock', label: 'Item out of stock' },
  { value: 'duplicate_order', label: 'Duplicate order' },
  { value: 'other', label: 'Other reason' },
]

export const statusLabel = (status) => STATUS_META[status]?.label ?? status
