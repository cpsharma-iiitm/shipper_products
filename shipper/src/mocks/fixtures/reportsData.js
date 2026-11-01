// DEV FIXTURES — the reporting aggregates behind the Reports screens (pure data).
//
// The figures below are what the design shows for the default period (1–28 Oct 2026). They stand in for
// aggregates the real backend would compute from its own tables, so they are static constants and are not
// summed from `db.orders` (the mock db holds only 291 orders, the backend reports on every order).
// ASSUMPTION — confirm with backend team: every figure, label and the compare modes.

export const OVERVIEW_DEFAULTS = {
  grossSales: 482560,
  gstCollected: 57480,
  averageOrderValue: 375.83,
  walletLiability: 62450,
  customersWithBalance: 312,
}

// How much the default period grew against each comparison, in percent.
export const COMPARE_MODES = {
  previous_month: { label: 'Previous month', grossGrowth: 12.8, averageOrderValueGrowth: 4.2 },
  previous_period: { label: 'Previous period', grossGrowth: 6.1, averageOrderValueGrowth: 2.1 },
  last_year: { label: 'Same period last year', grossGrowth: 34.2, averageOrderValueGrowth: 9.6 },
}

// Order mix of the 1,284 orders in the default period; other periods are scaled to this mix.
export const ORDER_STATUS_MIX = [
  { key: 'delivered', label: 'Delivered', count: 1038, percent: 81 },
  { key: 'in_transit', label: 'In Transit', count: 148, percent: 12 },
  { key: 'pending', label: 'Packed / pending', count: 62, percent: 5 },
  { key: 'returned', label: 'Returned / cancelled', count: 36, percent: 2 },
]

// The customers and products the overview features until the viewer searches.
export const FEATURED_CUSTOMER_IDS = ['cus_aditi', 'cus_rohitverma', 'cus_meeranair']
export const FEATURED_PRODUCTS = [
  { code: 'HL001', units: 486 },
  { code: 'SH002', units: 312 },
  { code: 'PC003', units: 284 },
]

// The financial report's headline figures for the unfiltered default period (126 orders, 386 product lines).
export const FINANCIAL_DEFAULTS = {
  orders: 126,
  lineItems: 386,
  taxableValue: 42891.43,
  gstTotal: 5248.57,
  shippingTotal: 3600,
  grossAmount: 51740,
  walletUsed: 4200,
}
