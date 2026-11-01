import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. A customer is
//   { code, name, email, mobile, city, state, pin, ordersCount, totalSpend, walletBalance, status: 'active' | 'inactive', joinedAt }
// ordersCount, totalSpend and walletBalance are backend aggregates; the browser never recalculates them.

/**
 * GET customers (q, status, city, wallet: with | none, sort: 'field' | '-field', page, pageSize) →
 *   { items, page, pageSize, totalItems, pageCount,
 *     counts: { all, active, inactive, withWallet }, facets: { cities: string[] } }
 */
export async function listCustomers(params) {
  const { data } = await http.get(endpoints.admin.customers.list, { params })
  return data
}

/** GET { items: [{ code, name }] } — every customer, for filter dropdowns. */
export async function listCustomerOptions() {
  const { data } = await http.get(endpoints.admin.customers.options)
  return data.items
}

/**
 * GET one customer →
 *   { customer, stats: { ordersCount, totalSpend, walletBalance, averageOrderValue, lastOrderAt },
 *     addresses: [address], walletTransactions: [{ id, type: 'credit' | 'debit', amount, reason, reference, at, balanceAfter }],
 *     recentOrders: [order list row] }   (wallet ledger newest first; balanceAfter is the running balance)
 */
export async function getCustomer(code) {
  const { data } = await http.get(endpoints.admin.customers.item(code))
  return data
}
