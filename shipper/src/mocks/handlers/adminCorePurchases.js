// DEV FIXTURES — admin purchases: an assisted purchase an admin creates for a customer. Totals come
// from the fake backend's pricing rules (mocks/lib/quote.js); the frontend only displays them.
// Payment is simulated: "submitting" a purchase records a pending payment request, nothing is charged
// and no Razorpay API is called. The purchases live in memory and reset on reload.
// ASSUMPTION — confirm with backend team: every path, payload and response shape in this file, and
// that a paid purchase becomes an order on the backend (not modelled here).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getCustomerByCode, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { PAYMENT_METHODS, PURCHASE_SEEDS, PURCHASE_STATUS_OPTIONS } from '@/mocks/fixtures/purchasesData'
import { SERVICEABLE_PINS } from '@/mocks/fixtures/serviceability'
import { requireAdmin } from '@/mocks/lib/auth'
import { matchesText, paginate, sortBy } from '@/mocks/lib/paginate'
import { computeQuote, round2, WALLET_ORDER_CAP } from '@/mocks/lib/quote'

const OPEN_STATUSES = ['draft', 'payment_pending']

const toCustomerView = (customer) => ({
  code: customer.code,
  name: customer.name,
  mobile: customer.mobile,
  email: customer.email,
  walletBalance: customer.walletBalance,
  addresses: (db.addresses[customer.id] ?? []).map((address) => ({ ...address })),
})

function resolveCustomerAndAddress({ customerCode, addressId }) {
  const customer = getCustomerByCode(customerCode)
  if (!customer) throw new MockHttpError(422, 'Find the customer first.', { message: 'Find the customer first.', errors: { customer: 'Find the customer first.' } })
  const address = (db.addresses[customer.id] ?? []).find((entry) => entry.id === addressId)
  if (!address) throw new MockHttpError(422, 'Choose a delivery address.', { message: 'Choose a delivery address.', errors: { address: 'Choose a delivery address.' } })
  return { customer, address }
}

/** Prices the lines for the customer and address, and reports delivery and stock availability. */
function priceLines({ customer, address, lines = [], useWallet }) {
  const resolved = lines.map(({ productCode, quantity }) => {
    const product = getProduct(productCode)
    if (!product || product.deletedAt) throw new MockHttpError(422, `Product ${productCode} is not available.`)
    return { product, quantity: Math.max(1, Math.floor(Number(quantity)) || 1) }
  })
  const quote = computeQuote({ lines: resolved, destinationState: address.state, useWallet, walletBalance: customer.walletBalance })

  const quoteLines = quote.lines.map((line) => {
    const product = getProduct(line.productCode)
    const available = product.status === 'active' && line.quantity <= product.stock
    return {
      productCode: line.productCode,
      name: line.name,
      unit: line.unit,
      quantity: line.quantity,
      pv: line.pv,
      linePv: line.pv * line.quantity,
      mrp: line.mrp,
      unitPrice: line.unitPrice,
      gstPercent: line.gstPercent,
      lineTotal: line.lineTotal,
      availableStock: product.stock,
      maxQuantity: product.stock,
      available,
    }
  })
  const unavailable = quoteLines.filter((line) => !line.available)
  const area = SERVICEABLE_PINS[address.pin]

  return {
    lines: quoteLines,
    summary: {
      ...quote.summary,
      totalPv: quoteLines.reduce((total, line) => total + line.linePv, 0),
    },
    wallet: {
      ...quote.wallet,
      applicable: round2(Math.min(customer.walletBalance, WALLET_ORDER_CAP, quote.summary.grossAmount)),
    },
    delivery: {
      addressId: address.id,
      pin: address.pin,
      city: area?.city ?? address.city,
      state: address.state,
      serviceable: Boolean(area),
      gstStateCode: quote.summary.gstStateCode,
      supply: quote.summary.gstType,
    },
    availability: {
      allAvailable: unavailable.length === 0,
      message:
        unavailable.length === 0
          ? null
          : `Not enough stock for ${unavailable.map((line) => line.productCode).join(', ')}.`,
    },
  }
}

function buildRecord({ purchaseNumber, status, customer, address, lines, useWallet, paymentMethod, createdAt, createdBy, reference }) {
  const priced = priceLines({ customer, address, lines, useWallet })
  const method = PAYMENT_METHODS.find((entry) => entry.value === paymentMethod) ?? PAYMENT_METHODS[0]
  return {
    purchaseNumber,
    status,
    customer: toCustomerView(customer),
    address: { ...address },
    lines: priced.lines,
    summary: priced.summary,
    wallet: priced.wallet,
    delivery: priced.delivery,
    useWallet,
    paymentMethod: method.value,
    paymentLabel: method.label,
    collectLabel: method.collectLabel,
    reference,
    createdAt,
    createdBy,
    updatedAt: createdAt,
  }
}

let store = null

function purchases() {
  if (!store) {
    store = PURCHASE_SEEDS.map(([purchaseNumber, customerCode, createdAt, createdBy, status, paymentMethod, items, useWallet]) => {
      const customer = getCustomerByCode(customerCode)
      const address = (db.addresses[customer.id] ?? []).find((entry) => entry.isDefault) ?? db.addresses[customer.id][0]
      return buildRecord({
        purchaseNumber,
        status,
        customer,
        address,
        lines: items.map(([productCode, quantity]) => ({ productCode, quantity })),
        useWallet,
        paymentMethod,
        createdAt,
        createdBy,
        reference: status === 'draft' ? null : `RZP-${purchaseNumber.slice(4)}`,
      })
    })
  }
  return store
}

const toListItem = (purchase) => ({
  purchaseNumber: purchase.purchaseNumber,
  status: purchase.status,
  customerCode: purchase.customer.code,
  customerName: purchase.customer.name,
  createdAt: purchase.createdAt,
  createdBy: purchase.createdBy,
  products: purchase.summary.products,
  units: purchase.summary.units,
  grossAmount: purchase.summary.grossAmount,
  payable: purchase.summary.payable,
  paymentLabel: purchase.paymentLabel,
  reference: purchase.reference,
})

/** PUR-<MMDD>-<NN>: the next free draft number for the fixture day. */
function nextPurchaseNumber() {
  const [day, month] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit' })
    .format(new Date(FIXTURE_NOW))
    .split('/')
  const prefix = `PUR-${month}${day}-`
  const used = purchases()
    .filter((purchase) => purchase.purchaseNumber.startsWith(prefix))
    .map((purchase) => Number(purchase.purchaseNumber.slice(prefix.length)))
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(2, '0')}`
}

function findPurchase(purchaseNumber) {
  const purchase = purchases().find((entry) => entry.purchaseNumber === purchaseNumber)
  if (!purchase) throw new MockHttpError(404, `Purchase ${purchaseNumber} was not found.`)
  return purchase
}

const failValidation = (message, errors = {}) => {
  throw new MockHttpError(422, message, { message, errors })
}

export const adminPurchaseHandlers = [
  defineHandler('get', '/admin/purchases/draft', ({ headers }) => {
    const admin = requireAdmin(headers)
    return { data: { purchaseNumber: nextPurchaseNumber(), createdBy: admin.name, paymentMethods: PAYMENT_METHODS } }
  }),

  defineHandler('get', '/admin/purchases/customers', ({ query, headers }) => {
    requireAdmin(headers)
    // The field shows "CUS00128 · Aditi Sharma" after a pick; only the part before the dot is a search term.
    const term = String(query.q ?? '').split('·')[0].trim()
    if (term.length < 2) return { data: { items: [] } }
    const items = db.customers
      .filter((customer) => matchesText(term, customer.code, customer.name, customer.mobile, customer.email))
      .slice(0, 5)
      .map(toCustomerView)
    return { data: { items } }
  }),

  defineHandler('get', '/admin/purchases/products', ({ headers }) => {
    requireAdmin(headers)
    const items = db.products
      .filter((product) => !product.deletedAt && product.status === 'active' && product.stock > 0)
      .map((product) => ({ code: product.code, name: product.name, unit: product.unit, stock: product.stock }))
    return { data: { items } }
  }),

  defineHandler('post', '/admin/purchases/quote', ({ body, headers }) => {
    requireAdmin(headers)
    const { customer, address } = resolveCustomerAndAddress(body ?? {})
    return { data: priceLines({ customer, address, lines: body.lines, useWallet: Boolean(body.useWallet) }) }
  }),

  defineHandler('get', '/admin/purchases', ({ query, headers }) => {
    requireAdmin(headers)
    const matching = purchases().filter(
      (purchase) =>
        (!query.status || query.status === 'all' || purchase.status === query.status) &&
        matchesText(query.q, purchase.purchaseNumber, purchase.customer.name, purchase.customer.code, purchase.reference),
    )
    const sorted = sortBy(matching, query.sort ?? '-createdAt', {
      grossAmount: (purchase) => purchase.summary.grossAmount,
      customerName: (purchase) => purchase.customer.name,
    })
    const page = paginate(sorted, query)
    return { data: { ...page, items: page.items.map(toListItem), statusOptions: PURCHASE_STATUS_OPTIONS } }
  }),

  defineHandler('get', '/admin/purchases/:purchaseNumber', ({ params, headers }) => {
    requireAdmin(headers)
    return { data: findPurchase(params.purchaseNumber) }
  }),

  // Saves a draft, or submits it: "submit" records a pending payment request (simulated).
  defineHandler('post', '/admin/purchases', ({ body, headers }) => {
    const admin = requireAdmin(headers)
    const input = body ?? {}
    const submitting = input.action === 'submit'
    const { customer, address } = resolveCustomerAndAddress(input)
    const lines = Array.isArray(input.lines) ? input.lines : []
    if (submitting && lines.length === 0) failValidation('Add at least one item.', { lines: 'Add at least one item.' })
    if (!PAYMENT_METHODS.some((method) => method.value === input.paymentMethod)) failValidation('Choose a payment method.', { paymentMethod: 'Choose a payment method.' })

    const priced = priceLines({ customer, address, lines, useWallet: Boolean(input.useWallet) })
    if (submitting && !priced.delivery.serviceable) failValidation(`PIN ${address.pin} is not serviceable.`)
    if (submitting && !priced.availability.allAvailable) failValidation(priced.availability.message)

    const existing = purchases().find((entry) => entry.purchaseNumber === input.purchaseNumber)
    if (existing && existing.status !== 'draft') throw new MockHttpError(409, `${existing.purchaseNumber} can no longer be edited.`)

    const purchaseNumber = existing?.purchaseNumber ?? input.purchaseNumber ?? nextPurchaseNumber()
    const record = buildRecord({
      purchaseNumber,
      status: submitting ? 'payment_pending' : 'draft',
      customer,
      address,
      lines,
      useWallet: Boolean(input.useWallet),
      paymentMethod: input.paymentMethod,
      createdAt: existing?.createdAt ?? FIXTURE_NOW,
      createdBy: existing?.createdBy ?? admin.name,
      reference: submitting ? `RZP-${purchaseNumber.slice(4)}` : null,
    })
    record.updatedAt = FIXTURE_NOW

    if (existing) Object.assign(existing, record)
    else purchases().unshift(record)
    return { status: existing ? 200 : 201, data: record }
  }),

  defineHandler('post', '/admin/purchases/:purchaseNumber/cancel', ({ params, headers }) => {
    requireAdmin(headers)
    const purchase = findPurchase(params.purchaseNumber)
    if (!OPEN_STATUSES.includes(purchase.status)) throw new MockHttpError(409, `${purchase.purchaseNumber} is ${purchase.status.replace('_', ' ')} and can no longer be cancelled.`)
    purchase.status = 'cancelled'
    purchase.updatedAt = FIXTURE_NOW
    return { data: toListItem(purchase) }
  }),
]
