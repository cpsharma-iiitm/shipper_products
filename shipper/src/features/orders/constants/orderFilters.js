// Filter vocabulary of the My orders screen. The values are sent to the backend as query parameters.
// ASSUMPTION — confirm with backend team: `status` is one of the stage keys below and `period` one of the
// period keys; "all" means no filter.
export const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const ORDER_PERIOD_OPTIONS = [
  { value: '1m', label: 'Last month' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'all', label: 'All time' },
]

export const DEFAULT_ORDER_FILTERS = { status: 'all', period: '3m' }

// Four orders per page, as in the design ("Showing 1–4 of 12 orders").
export const ORDERS_PAGE_SIZE = 4
