// Customer-facing wording for the fulfilment statuses the backend returns, and the stage each one belongs to.
// ASSUMPTION — confirm with backend team: the customer order API returns the same status keys as the admin
// one (new → … → delivered, returned, cancelled) and groups them into the filter stages below.
export const CUSTOMER_ORDER_STATUS = {
  new: { label: 'Order placed', tone: 'info', stage: 'processing' },
  to_pick: { label: 'Processing', tone: 'warning', stage: 'processing' },
  to_pack: { label: 'Processing', tone: 'warning', stage: 'processing' },
  packed: { label: 'Packed', tone: 'info', stage: 'processing' },
  dispatched: { label: 'Dispatched', tone: 'info', stage: 'shipped' },
  in_transit: { label: 'In Transit', tone: 'info', stage: 'shipped' },
  out_for_delivery: { label: 'Out for delivery', tone: 'info', stage: 'shipped' },
  delivered: { label: 'Delivered', tone: 'success', stage: 'delivered' },
  returned: { label: 'Returned', tone: 'danger', stage: 'returned' },
  cancelled: { label: 'Cancelled', tone: 'neutral', stage: 'cancelled' },
}

const FALLBACK_STATUS = { label: 'Processing', tone: 'neutral', stage: 'processing' }

export const getCustomerOrderStatus = (status) => CUSTOMER_ORDER_STATUS[status] ?? FALLBACK_STATUS
