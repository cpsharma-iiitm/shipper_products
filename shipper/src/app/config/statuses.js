// Display vocabulary for StatusBadge. Keys are the app's display keys.
// ASSUMPTION — confirm with backend team: the mapper layer converts backend status values into
// these keys (order lifecycle, payment, product, priority). Tones marked "design" are taken from
// the Figma artboards; the rest are inferred and should be re-checked against the design.
export const STATUS_META = {
  // Order and fulfilment
  new: { label: 'New', tone: 'warning' }, // design
  on_hold: { label: 'On hold', tone: 'warning' },
  to_pick: { label: 'To pick', tone: 'info' },
  to_pack: { label: 'To pack', tone: 'warning' }, // design
  packed: { label: 'Packed', tone: 'success' }, // design
  ready_to_dispatch: { label: 'Ready to dispatch', tone: 'info' },
  dispatched: { label: 'Dispatched', tone: 'info' }, // design
  in_transit: { label: 'In Transit', tone: 'info' }, // design
  out_for_delivery: { label: 'Out for delivery', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' }, // design
  returned: { label: 'Returned', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  delayed: { label: 'Delayed', tone: 'danger' },
  placed: { label: 'Order placed', tone: 'info' },
  // Payment and verification
  paid: { label: 'Paid', tone: 'success' }, // design
  pending: { label: 'Pending', tone: 'warning' }, // design
  failed: { label: 'Failed', tone: 'danger' },
  verified: { label: 'Verified', tone: 'success' }, // design
  refunded: { label: 'Refunded', tone: 'neutral' },
  partially_refunded: { label: 'Partially refunded', tone: 'neutral' },
  unverified: { label: 'Unverified', tone: 'warning' },
  // Product
  active: { label: 'Active', tone: 'success' }, // design
  inactive: { label: 'Inactive', tone: 'neutral' },
  low_stock: { label: 'Low stock', tone: 'danger' }, // design
  out_of_stock: { label: 'Out of stock', tone: 'danger' },
  // Purchases (admin assisted purchases)
  draft: { label: 'Draft', tone: 'neutral' },
  payment_pending: { label: 'Payment pending', tone: 'warning' },
  // Priority (exception queue)
  critical: { label: 'Critical', tone: 'danger' },
  high: { label: 'High', tone: 'warning' },
  medium: { label: 'Medium', tone: 'info' },
  standard: { label: 'Standard', tone: 'neutral' },
  // Address
  default: { label: 'Default', tone: 'info' },
}