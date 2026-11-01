// DEV FIXTURES — profile, password and wallet endpoints of the signed-in customer for the mock API.
// ASSUMPTION — confirm with backend team: paths and payloads (see features/profile and features/wallet services).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, ensureCustomer, walletBalanceOf } from '@/mocks/db'
import { DEMO_PASSWORD } from '@/mocks/fixtures/users'
import { requireUser } from '@/mocks/lib/auth'
import { paginate } from '@/mocks/lib/paginate'
import { WALLET_ORDER_CAP } from '@/mocks/lib/quote'

const MOBILE_PATTERN = /^[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeMobile = (value = '') => String(value).replace(/[\s-]/g, '').replace(/^\+?91(?=\d{10}$)/, '')
const publicProfile = ({ id, name, email, mobile }) => ({ id, name, email, mobile })

function requireCustomer(headers) {
  const user = requireUser(headers)
  if (user.role !== 'customer') throw new MockHttpError(403, 'This area is for customer accounts.')
  return user
}

const fieldErrors = (status, message, errors) => new MockHttpError(status, message, { message, errors })

// A ledger line is either money in (refund, cashback, bonus) or the wallet used to pay for an order.
const CREDIT_KINDS = [
  ['refund', /^refund/i],
  ['cashback', /cashback/i],
  ['bonus', /bonus/i],
]
const kindOf = (transaction) =>
  transaction.type === 'debit' ? 'order_payment' : (CREDIT_KINDS.find(([, pattern]) => pattern.test(transaction.reason))?.[0] ?? 'credit')

const toTransaction = (transaction) => ({
  id: transaction.id,
  type: transaction.type,
  kind: kindOf(transaction),
  amount: transaction.amount,
  reason: transaction.reason,
  orderNumber: transaction.reference,
  at: transaction.at,
})

const ledgerOf = (customerId) =>
  db.walletTransactions.filter((transaction) => transaction.customerId === customerId).sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

export const accountHandlers = [
  defineHandler('get', '/account/profile', ({ headers }) => ({ data: publicProfile(requireCustomer(headers)) })),

  defineHandler('put', '/account/profile', ({ body, headers }) => {
    const account = requireCustomer(headers)
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const mobile = normalizeMobile(body?.mobile)

    const errors = {}
    if (!name) errors.name = 'Enter your full name.'
    if (!MOBILE_PATTERN.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.'
    if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
    if (Object.keys(errors).length > 0) throw fieldErrors(422, 'Please check the highlighted fields and try again.', errors)

    const others = db.accounts.filter((entry) => entry.id !== account.id)
    if (others.some((entry) => entry.mobile === mobile)) {
      throw fieldErrors(409, 'This mobile number is already linked to another account.', { mobile: 'This mobile number is already linked to another account.' })
    }
    if (others.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
      throw fieldErrors(409, 'This email address is already linked to another account.', { email: 'This email address is already linked to another account.' })
    }

    Object.assign(account, { name, email, mobile })
    Object.assign(ensureCustomer(account), { name, email, mobile })
    return { data: publicProfile(account) }
  }),

  defineHandler('post', '/account/password', ({ body, headers }) => {
    const account = requireCustomer(headers)
    if ((account.password ?? DEMO_PASSWORD) !== body?.currentPassword) {
      throw fieldErrors(422, 'Your current password is incorrect.', { currentPassword: 'Your current password is incorrect.' })
    }
    if (String(body?.newPassword ?? '').length < 8) {
      throw fieldErrors(422, 'The new password is too short.', { newPassword: 'Use 8+ characters, including a number and a special character.' })
    }
    account.password = body.newPassword
    return { status: 204 }
  }),

  defineHandler('get', '/account/wallet', ({ headers }) => {
    const account = requireCustomer(headers)
    const { id } = ensureCustomer(account)
    const lastCredit = ledgerOf(id).find((transaction) => transaction.type === 'credit')
    return {
      data: {
        balance: walletBalanceOf(id),
        lastCredit: lastCredit ? { amount: lastCredit.amount, kind: kindOf(lastCredit), at: lastCredit.at } : null,
        // Rules are enforced by the backend at checkout; the screen only describes them.
        rules: { maxPerOrder: WALLET_ORDER_CAP, combinableWithCoupon: false },
      },
    }
  }),

  defineHandler('get', '/account/wallet/transactions', ({ query, headers }) => {
    const { id } = requireCustomer(headers)
    const { items, ...paging } = paginate(ledgerOf(id), { page: query.page, pageSize: query.pageSize ?? 10 })
    return { data: { items: items.map(toTransaction), ...paging } }
  }),
]
