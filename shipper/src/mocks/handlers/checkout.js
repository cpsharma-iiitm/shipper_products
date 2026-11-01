// DEV FIXTURES — checkout and payment handlers for the mock API (owned by the cart/checkout feature).
//
// Placing an order validates the cart with the same fake pricing rules as POST /cart/quote, debits the
// customer's wallet, and adds an order to `db.orders` in exactly the shape the fixtures use, so it shows
// up in the customer's order history and in the admin "New orders" queue. Payment is simulated end to
// end: nothing here talks to Razorpay and none of it is production-ready.
//
// ASSUMPTION — confirm with backend team: every path, payload and response below, and that
//  - the wallet is held (debited) when the order is placed and released if the order expires unpaid,
//  - an order awaits payment with paymentStatus "pending" ("failed" after a failed attempt),
//  - the backend rejects a stale `expectedPayable` with 409 so the customer never pays an unseen amount.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, ensureCustomer, getOrder, getProduct, nextOrderNumber, ordersOfCustomer, withLineImages } from '@/mocks/db'
import { FIXTURE_NOW, fromNow } from '@/mocks/fixtures/clock'
import { SERVICEABLE_PINS, SHIPPING_METHOD } from '@/mocks/fixtures/serviceability'
import { requireUser } from '@/mocks/lib/auth'
import { computeQuote, round2 } from '@/mocks/lib/quote'

const ASSIGNEES = ['Suresh Kumar', 'Anjali Singh', 'Aman Singh', 'Neha Joshi']
const PAYMENT_METHODS = { upi: 'UPI', card: 'Card', netbanking: 'Netbanking' }

// Payment sessions opened by this tab: { [sessionId]: { orderNumber, gatewayOrderId } }
const sessions = new Map()

function requireCustomer(headers) {
  const user = requireUser(headers)
  if (user.role !== 'customer') throw new MockHttpError(403, 'Only customer accounts can place orders.')
  return ensureCustomer(user)
}

function ownedOrder(customer, orderNumber) {
  const order = getOrder(orderNumber)
  if (!order || order.customerId !== customer.id) throw new MockHttpError(404, 'Order not found.')
  return order
}

function readLines(items) {
  if (!Array.isArray(items) || items.length === 0) throw new MockHttpError(422, 'Your cart is empty.')
  return items.map((item) => {
    const product = getProduct(item?.productCode)
    if (!product || product.status !== 'active') throw new MockHttpError(409, 'An item in your cart is no longer available.')
    return { product, quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1) }
  })
}

function assertAvailable(quoteLines) {
  quoteLines.forEach((line) => {
    if (line.maxQuantity === 0) throw new MockHttpError(409, `${line.name} is out of stock. Remove it from your cart to continue.`)
    if (line.quantity > line.maxQuantity) {
      throw new MockHttpError(409, `You can order up to ${line.maxQuantity} of ${line.name}. Update the quantity to continue.`)
    }
  })
}

/** Marks the order paid and books what a paid order changes: the wallet debit and the customer's totals. */
function settleOrder(customer, order, razorpayPaymentId = null) {
  const { walletApplied, itemsTotal } = order.summary
  if (walletApplied > customer.walletBalance) {
    throw new MockHttpError(409, 'Your wallet balance changed since you last looked. Please review your order and try again.')
  }

  order.paymentStatus = 'paid'
  order.razorpayPaymentId = razorpayPaymentId
  customer.ordersCount += 1
  customer.totalSpend = round2(customer.totalSpend + itemsTotal)
  if (walletApplied > 0) {
    customer.walletBalance = round2(customer.walletBalance - walletApplied)
    db.walletTransactions.push({
      id: `wtx_${db.walletTransactions.length + 1}`,
      customerId: customer.id,
      type: 'debit',
      amount: walletApplied,
      reason: `Used on order ${order.orderNumber}`,
      reference: order.orderNumber,
      at: FIXTURE_NOW,
    })
  }
}

function nextQueueRank() {
  const ranks = db.orders.filter((order) => order.status === 'new').map((order) => order.fulfilment.queueRank)
  return Math.min(...ranks, 1) - 1
}

function buildOrder({ orderNumber, customer, contact, address, alternateMobile, deliveryInstructions, quote }) {
  const digits = orderNumber.slice(2)
  const { summary } = quote
  return {
    orderNumber,
    customerId: customer.id,
    customerCode: customer.code,
    customerName: contact.name || customer.name,
    customerMobile: contact.mobile || customer.mobile,
    customerEmail: contact.email || customer.email,
    placedAt: FIXTURE_NOW,
    channel: 'web',
    status: 'new',
    paymentStatus: 'pending',
    paymentMethod: PAYMENT_METHODS.upi,
    razorpayPaymentId: null,
    invoiceNumber: `INV-26-${digits}`,
    lines: quote.lines.map((line) => ({
      productCode: line.productCode,
      name: line.name,
      unit: line.unit,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      mrp: line.mrp,
      gstPercent: line.gstPercent,
      hsn: line.hsn,
      batch: line.batch,
      pv: line.pv,
      bin: getProduct(line.productCode).bin,
      taxable: line.taxable,
      gst: line.gst,
      lineTotal: line.lineTotal,
    })),
    summary: {
      units: summary.units,
      itemsTotal: summary.itemsTotal,
      taxableSubtotal: summary.taxableSubtotal,
      gstTotal: summary.gstTotal,
      cgst: summary.cgst,
      sgst: summary.sgst,
      igst: summary.igst,
      shipping: summary.shipping,
      grossAmount: summary.grossAmount,
      couponDiscount: summary.couponDiscount,
      walletApplied: summary.walletApplied,
      payable: summary.payable,
    },
    address: {
      label: address.label,
      name: address.name,
      mobile: address.mobile,
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pin: address.pin,
      verified: address.verified,
      ...(alternateMobile ? { alternateMobile } : {}),
    },
    deliveryInstructions,
    timestamps: { confirmedAt: FIXTURE_NOW },
    shipment: null,
    refund: null,
    onHold: false,
    delay: null,
    fulfilment: {
      warehouse: 'Lucknow · WH01',
      assignee: ASSIGNEES[db.orders.length % ASSIGNEES.length],
      pickBatch: null,
      priority: 'standard',
      packedBy: null,
      packaging: null,
      queueRank: nextQueueRank(),
    },
  }
}

export const checkoutHandlers = [
  // Body: { items: [{ productCode, quantity }], couponCode?, useWallet, addressId, contact: { name, mobile, email },
  //         alternateMobile?, deliveryInstructions?, expectedPayable }
  defineHandler('post', '/checkout/orders', ({ body, headers }) => {
    const customer = requireCustomer(headers)
    const lines = readLines(body?.items)

    const address = (db.addresses[customer.id] ?? []).find((entry) => entry.id === body?.addressId)
    if (!address) throw new MockHttpError(422, 'Choose a delivery address to continue.')
    if (!SERVICEABLE_PINS[address.pin]) throw new MockHttpError(422, 'We do not deliver to this address yet.')

    const quote = computeQuote({
      lines,
      destinationState: address.state,
      useWallet: Boolean(body?.useWallet),
      walletBalance: customer.walletBalance,
      couponCode: body?.couponCode || undefined,
      hasPriorOrders: ordersOfCustomer(customer.id).length > 0,
    })
    assertAvailable(quote.lines)
    if (quote.coupon && !quote.coupon.valid) throw new MockHttpError(422, quote.coupon.message)
    if (round2(Number(body?.expectedPayable)) !== quote.summary.payable) {
      throw new MockHttpError(409, 'Prices or offers changed since you last looked. Please review your order and try again.')
    }

    const order = buildOrder({
      orderNumber: nextOrderNumber(),
      customer,
      contact: body?.contact ?? {},
      address,
      alternateMobile: String(body?.alternateMobile ?? '').trim(),
      deliveryInstructions: String(body?.deliveryInstructions ?? '').trim(),
      quote,
    })
    db.orders.push(order)

    // Nothing left to collect when the wallet covers the whole order.
    if (quote.summary.payable === 0) {
      order.paymentMethod = 'Wallet'
      settleOrder(customer, order)
    }

    return {
      status: 201,
      data: { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, amountDue: quote.summary.payable, currency: 'INR' },
    }
  }),

  defineHandler('get', '/checkout/orders/:orderNumber', ({ params, headers }) => {
    const order = ownedOrder(requireCustomer(headers), params.orderNumber)
    const area = SERVICEABLE_PINS[order.address.pin]
    return {
      data: {
        ...withLineImages(order),
        delivery: {
          method: SHIPPING_METHOD,
          etaFrom: area ? fromNow({ days: area.etaMinDays }) : null,
          etaTo: area ? fromNow({ days: area.etaMaxDays }) : null,
        },
      },
    }
  }),

  // Body: { orderNumber, method: 'upi' | 'card' | 'netbanking' }
  defineHandler('post', '/payments/sessions', ({ body, headers }) => {
    const order = ownedOrder(requireCustomer(headers), body?.orderNumber)
    if (order.paymentStatus === 'paid') throw new MockHttpError(409, 'This order has already been paid.')
    if (!PAYMENT_METHODS[body?.method]) throw new MockHttpError(422, 'Choose a payment method to continue.')

    order.paymentStatus = 'pending'
    order.paymentMethod = PAYMENT_METHODS[body.method]
    const sessionId = `ps_${order.orderNumber}_${sessions.size + 1}`
    const gatewayOrderId = `order_MOCK${order.orderNumber.slice(2)}${sessions.size + 1}`
    sessions.set(sessionId, { orderNumber: order.orderNumber, gatewayOrderId })

    return {
      status: 201,
      data: {
        sessionId,
        orderNumber: order.orderNumber,
        gateway: 'razorpay',
        gatewayOrderId,
        keyId: 'rzp_test_DEV_FIXTURE',
        amount: order.summary.payable,
        currency: 'INR',
      },
    }
  }),

  // Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }. The real backend verifies the signature
  // with its Razorpay secret; this fixture only checks that the gateway answered for this session.
  defineHandler('post', '/payments/sessions/:sessionId/confirm', ({ params, body, headers }) => {
    const customer = requireCustomer(headers)
    const session = sessions.get(params.sessionId)
    if (!session) throw new MockHttpError(404, 'Payment session not found.')
    const order = ownedOrder(customer, session.orderNumber)
    if (body?.razorpayOrderId !== session.gatewayOrderId || !body?.razorpayPaymentId || !body?.razorpaySignature) {
      throw new MockHttpError(400, 'We could not verify this payment. If money was deducted it will be refunded.')
    }

    settleOrder(customer, order, body.razorpayPaymentId)
    return { data: { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus } }
  }),

  // Body: { reason }
  defineHandler('post', '/payments/sessions/:sessionId/failure', ({ params, headers }) => {
    const customer = requireCustomer(headers)
    const session = sessions.get(params.sessionId)
    if (!session) throw new MockHttpError(404, 'Payment session not found.')
    const order = ownedOrder(customer, session.orderNumber)
    if (order.paymentStatus !== 'paid') order.paymentStatus = 'failed'
    return { status: 204 }
  }),
]
