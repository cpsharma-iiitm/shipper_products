// DEV FIXTURES — admin customer management for the mock API.
// ASSUMPTION — confirm with backend team: paths, query parameters and payloads (see features/customers/services).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getCustomerByCode, ordersOfCustomer } from '@/mocks/db'
import { requireAdmin } from '@/mocks/lib/auth'
import { round2 } from '@/mocks/lib/quote'
import { matchesText, sortBy } from '@/mocks/lib/paginate'
import { listResponse } from './shared'
import { toOrderListItem } from './orderHandlers'

// The db marks every customer active; two are shown as inactive so the status filter has something to find.
const INACTIVE_CODES = new Set(['CUS00111', 'CUS00137'])

const present = (customer) => ({
  code: customer.code,
  name: customer.name,
  email: customer.email,
  mobile: customer.mobile,
  city: customer.city,
  state: customer.state,
  pin: customer.pin,
  // ordersCount, totalSpend and walletBalance are backend aggregates (static in the mock db).
  ordersCount: customer.ordersCount,
  totalSpend: customer.totalSpend,
  walletBalance: customer.walletBalance,
  status: INACTIVE_CODES.has(customer.code) ? 'inactive' : customer.status,
  joinedAt: customer.joinedAt,
})

const SORT = {
  joinedAt: (customer) => new Date(customer.joinedAt).getTime(),
}

const newestFirst = (a, b) => new Date(b.placedAt) - new Date(a.placedAt)

/** Stored wallet transactions, or a plausible ledger that adds up to the balance for customers with none. */
function ledgerEntries(customer) {
  const stored = db.walletTransactions.filter((transaction) => transaction.customerId === customer.id)
  if (stored.length > 0) return stored
  if (customer.walletBalance <= 0) return []
  const bonus = Math.min(customer.walletBalance, 50)
  const cashback = round2(customer.walletBalance - bonus)
  const latestOrder = ordersOfCustomer(customer.id).filter((order) => order.status === 'delivered').sort(newestFirst)[0]
  const entries = [{ id: `wtx_${customer.code}_1`, customerId: customer.id, type: 'credit', amount: bonus, reason: 'Welcome bonus', reference: null, at: customer.joinedAt }]
  if (cashback > 0) {
    entries.push({
      id: `wtx_${customer.code}_2`,
      customerId: customer.id,
      type: 'credit',
      amount: cashback,
      reason: latestOrder ? `Cashback on order ${latestOrder.orderNumber}` : 'Cashback',
      reference: latestOrder?.orderNumber ?? null,
      at: latestOrder?.placedAt ?? customer.joinedAt,
    })
  }
  return entries
}

function walletLedger(customer) {
  let balance = 0
  return [...ledgerEntries(customer)]
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .map((entry) => {
      balance = round2(balance + (entry.type === 'credit' ? entry.amount : -entry.amount))
      return { ...entry, balanceAfter: balance }
    })
    .reverse()
}

function buildList(query) {
  const all = db.customers.map(present)
  const matching = all.filter(
    (customer) =>
      matchesText(query.q, customer.name, customer.code, customer.mobile, customer.email, customer.city) &&
      (!query.status || customer.status === query.status) &&
      (!query.city || customer.city === query.city) &&
      (!query.wallet || (query.wallet === 'with' ? customer.walletBalance > 0 : customer.walletBalance === 0)),
  )
  return listResponse(sortBy(matching, query.sort || 'code', SORT), query, {
    counts: {
      all: all.length,
      active: all.filter((customer) => customer.status === 'active').length,
      inactive: all.filter((customer) => customer.status === 'inactive').length,
      withWallet: all.filter((customer) => customer.walletBalance > 0).length,
    },
    facets: { cities: [...new Set(all.map((customer) => customer.city).filter(Boolean))].sort() },
  })
}

function buildDetail(code) {
  const raw = getCustomerByCode(code)
  if (!raw) throw new MockHttpError(404, 'Customer not found.')
  const customer = present(raw)
  const orders = [...ordersOfCustomer(raw.id)].sort(newestFirst)
  return {
    customer,
    stats: {
      ordersCount: customer.ordersCount,
      totalSpend: customer.totalSpend,
      walletBalance: customer.walletBalance,
      averageOrderValue: customer.ordersCount > 0 ? round2(customer.totalSpend / customer.ordersCount) : 0,
      lastOrderAt: orders[0]?.placedAt ?? null,
    },
    addresses: db.addresses[raw.id] ?? [],
    walletTransactions: walletLedger(raw),
    recentOrders: orders.slice(0, 6).map(toOrderListItem),
  }
}

export const customerHandlers = [
  defineHandler('get', '/admin/customers', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildList(query) }
  }),

  // Registered before `:code` so "options" is not read as a customer code.
  defineHandler('get', '/admin/customers/options', ({ headers }) => {
    requireAdmin(headers)
    return { data: { items: sortBy(db.customers, 'name').map((customer) => ({ code: customer.code, name: customer.name })) } }
  }),

  defineHandler('get', '/admin/customers/:code', ({ params, headers }) => {
    requireAdmin(headers)
    return { data: buildDetail(params.code) }
  }),
]
