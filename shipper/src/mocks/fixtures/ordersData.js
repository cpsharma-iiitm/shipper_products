// DEV FIXTURES — orders (pure data builder).
//
// ~300 orders whose stage counts match the design:
//   New 24 · To Pick 18 · To Pack 12 · Packed (ready to dispatch) 8  → 62 pending shipments (dashboard)
//   Dispatched tab: 148 shipments dispatched in the last 14 days (in transit, delivered, returned…)
//   Delayed: 6 orders with an exception (stock shortage, payment, shipping delay, address issue)
// plus Aditi Sharma's 12-order history (the four shown on the "My orders" screen are named).
//
// All names, numbers and amounts that appear in the design are reproduced; the rest are generated
// deterministically. Prices, GST, shipping and totals come from lib/quote.js (the fake backend's rules).
// ASSUMPTION — confirm with backend team: the whole order shape.
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { computeQuote, round2 } from '@/mocks/lib/quote'

const IST = '+05:30'
const stamp = (date, time) => `${date}T${time}:00${IST}`
const plusHours = (iso, hours) => new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString()

function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ASSIGNEES = ['Suresh Kumar', 'Anjali Singh', 'Aman Singh', 'Neha Joshi']
const METHODS = ['UPI', 'UPI', 'UPI', 'Card', 'Card', 'Netbanking']

export function buildOrders({ products, customers, addresses }) {
  const random = createRandom(4821)
  const byCode = new Map(products.map((product) => [product.code, product]))
  const byName = (name, unit) => products.find((product) => product.name === name && (!unit || product.unit === unit))
  const customerById = new Map(customers.map((customer) => [customer.id, customer]))
  const cid = (name) => `cus_${name.toLowerCase().replace(/[^a-z]+/g, '')}`
  const used = new Set()
  const orders = []

  const pick = (list) => list[Math.floor(random() * list.length)]
  const resolve = (key) => byCode.get(key) ?? byName(key)

  /**
   * Builds one order. `items` is [[codeOrName, quantity], …]. Times that are not given are derived from
   * `placedAt` and `status`.
   */
  function make(spec) {
    const {
      number,
      customerId,
      placedAt,
      items,
      status,
      paymentStatus = 'paid',
      method = pick(METHODS),
      wallet = 0,
      channel = 'web',
      timestamps = {},
      shipment: shipmentSpec,
      weightKg,
      fulfilment = {},
      delay = null,
      onHold = false,
      refund = null,
      deliveryInstructions = '',
      queueRank,
    } = spec
    const customer = customerById.get(customerId)
    const address = (addresses[customerId] ?? [])[0]
    const lines = items.map(([key, quantity]) => ({ product: resolve(key), quantity }))
    const quote = computeQuote({
      lines,
      destinationState: address.state,
      useWallet: wallet > 0,
      walletBalance: wallet > 0 ? Math.max(wallet, 250) : 0,
    })
    const digits = number.slice(2)
    used.add(number)

    const t = { confirmedAt: placedAt, ...timestamps }
    const rank = ['new', 'to_pick', 'to_pack', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled']
    const reached = (stage) => rank.indexOf(status) >= rank.indexOf(stage) && status !== 'cancelled'
    if (reached('to_pick') && !t.verifiedAt) t.verifiedAt = plusHours(placedAt, 1)
    if (reached('to_pack') && !t.pickedAt) t.pickedAt = plusHours(placedAt, 4)
    if (reached('packed') && !t.packedAt) t.packedAt = plusHours(placedAt, 8)
    if (reached('dispatched') && !t.dispatchedAt) t.dispatchedAt = plusHours(placedAt, 30)
    if (reached('in_transit') && !t.inTransitAt) t.inTransitAt = plusHours(t.dispatchedAt, 36)
    if (status === 'delivered' || status === 'returned') {
      if (!t.deliveredAt) t.deliveredAt = plusHours(t.dispatchedAt, 96)
    }
    if (status === 'returned' && !t.returnedAt) t.returnedAt = plusHours(t.deliveredAt, 48)

    const computedWeight = round2(lines.reduce((total, line) => total + line.product.weightKg * line.quantity, 0) + 0.15)
    const shipped = reached('dispatched') || shipmentSpec
    const shipment = shipped
      ? {
          carrier: 'India Post',
          service: shipmentSpec?.service ?? 'Speed Post',
          consignmentId: shipmentSpec?.consignmentId ?? `EU4839${String(Math.floor(random() * 90000) + 10000)}IN`,
          dispatchedAt: t.dispatchedAt,
          expectedDelivery: shipmentSpec?.expectedDelivery ?? plusHours(t.dispatchedAt, 96),
          deliveredAt: t.deliveredAt ?? null,
          weightKg: weightKg ?? computedWeight,
          dimensionsCm: { length: 24, width: 18, height: 12 },
          status: status === 'delivered' ? 'delivered' : status === 'returned' ? 'returned' : status === 'dispatched' ? 'dispatched' : 'in_transit',
          lastUpdate: shipmentSpec?.lastUpdate ?? null,
        }
      : null

    const order = {
      orderNumber: number,
      customerId,
      customerCode: customer.code,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerEmail: customer.email,
      placedAt,
      channel,
      status,
      paymentStatus: status === 'cancelled' ? 'refunded' : paymentStatus,
      paymentMethod: method,
      razorpayPaymentId: paymentStatus === 'paid' ? `pay_RZP${digits}` : null,
      invoiceNumber: reached('packed') || status === 'new' ? `INV-26-${digits}` : null,
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
        bin: byCode.get(line.productCode).bin,
        taxable: line.taxable,
        gst: line.gst,
        lineTotal: line.lineTotal,
      })),
      summary: {
        units: quote.summary.units,
        itemsTotal: quote.summary.itemsTotal,
        taxableSubtotal: quote.summary.taxableSubtotal,
        gstTotal: quote.summary.gstTotal,
        cgst: quote.summary.cgst,
        sgst: quote.summary.sgst,
        igst: quote.summary.igst,
        shipping: quote.summary.shipping,
        grossAmount: quote.summary.grossAmount,
        couponDiscount: 0,
        walletApplied: quote.summary.walletApplied,
        payable: quote.summary.payable,
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
      },
      deliveryInstructions,
      timestamps: t,
      shipment,
      refund,
      onHold,
      delay,
      fulfilment: {
        warehouse: 'Lucknow · WH01',
        assignee: fulfilment.assignee ?? ASSIGNEES[orders.length % ASSIGNEES.length],
        pickBatch: fulfilment.pickBatch ?? null,
        priority: fulfilment.priority ?? 'standard',
        packedBy: fulfilment.packedBy ?? (reached('packed') ? 'Anjali Singh' : null),
        packaging: reached('packed') ? 'Corrugated box · M' : null,
        queueRank: queueRank ?? 1000 + orders.length,
      },
    }
    orders.push(order)
    return order
  }

  // ── Aditi Sharma (the demo customer): the four orders on the "My orders" screen ─────────────────
  const ADITI_BASKET = [['HL001', 2], ['SH002', 1], ['PC003', 1]]
  make({
    number: 'SH10482',
    customerId: 'cus_aditi',
    placedAt: stamp('2026-10-24', '10:42'),
    items: ADITI_BASKET,
    status: 'in_transit',
    method: 'UPI',
    wallet: 100,
    weightKg: 0.85,
    timestamps: {
      packedAt: stamp('2026-10-25', '09:15'),
      dispatchedAt: stamp('2026-10-25', '16:30'),
      inTransitAt: stamp('2026-10-27', '08:20'),
    },
    shipment: {
      service: 'Speed Post',
      consignmentId: 'EU483920175IN',
      expectedDelivery: stamp('2026-10-29', '18:00'),
      lastUpdate: { at: stamp('2026-10-27', '08:20'), note: 'Arrived at Lucknow NSH' },
    },
    deliveryInstructions: 'Please call on arrival. Gate code: 4A',
    queueRank: 1,
  })
  make({ number: 'SH10316', customerId: 'cus_aditi', placedAt: stamp('2026-10-12', '14:05'), items: [['GR005', 1], ['CO004', 1]], status: 'delivered', method: 'Card' })
  make({ number: 'SH10198', customerId: 'cus_aditi', placedAt: stamp('2026-09-28', '19:40'), items: ADITI_BASKET, status: 'delivered', method: 'UPI' })
  make({
    number: 'SH10074',
    customerId: 'cus_aditi',
    placedAt: stamp('2026-09-14', '12:10'),
    items: [['PC006', 1]],
    status: 'returned',
    method: 'UPI',
    timestamps: { dispatchedAt: stamp('2026-09-14', '17:00'), deliveredAt: stamp('2026-09-16', '13:00'), returnedAt: stamp('2026-09-18', '12:30') },
    refund: { amount: 100, to: 'wallet', at: stamp('2026-09-18', '12:30') },
  })
  const ADITI_OLDER = [
    ['SH10033', '2026-09-08', [['HL001', 1], ['GR005', 2]]],
    ['SH09987', '2026-09-01', [['SH002', 2]]],
    ['SH09871', '2026-08-26', [['PC003', 2], ['CO004', 1]]],
    ['SH09764', '2026-08-19', [['GR005', 3], ['HL001', 1]]],
    ['SH09650', '2026-08-13', [['PC006', 1], ['SH002', 1]]],
    ['SH09532', '2026-08-09', [['CO004', 2]]],
    ['SH09418', '2026-08-05', [['HL001', 3], ['PC003', 1]]],
    ['SH09301', '2026-08-02', [['GR005', 1], ['SH002', 1], ['HL001', 1]]],
  ]
  ADITI_OLDER.forEach(([number, date, items]) =>
    make({ number, customerId: 'cus_aditi', placedAt: stamp(date, '11:20'), items, status: 'delivered', timestamps: { dispatchedAt: stamp(date, '16:30') } }),
  )

  // ── Dashboard "recent orders" (24–26 Oct) ────────────────────────────────────────────────────────
  make({
    number: 'SH10483',
    customerId: cid('Rohit Verma'),
    placedAt: stamp('2026-10-25', '09:20'),
    items: [['GR005', 4], ['SH002', 1], ['PC003', 1]],
    status: 'packed',
    weightKg: 1.2,
    queueRank: 2,
  })
  make({ number: 'SH10484', customerId: cid('Neha Singh'), placedAt: stamp('2026-10-25', '16:45'), items: [['SH002', 1], ['PC003', 1]], status: 'new', paymentStatus: 'pending', method: 'UPI' })
  make({
    number: 'SH10485',
    customerId: cid('Arjun Patel'),
    placedAt: stamp('2026-10-26', '10:05'),
    items: [['HL001', 1], ['SH002', 1], ['GR005', 3]],
    status: 'dispatched',
    shipment: { consignmentId: 'EU483920184IN', service: 'Speed Post' },
    timestamps: { dispatchedAt: stamp('2026-10-26', '16:30') },
    queueRank: 2,
  })

  // ── Store Operation · New orders (24) ────────────────────────────────────────────────────────────
  make({ number: 'SH10488', customerId: 'cus_aditi_2', placedAt: stamp('2026-10-28', '10:42'), items: ADITI_BASKET, status: 'new', method: 'UPI', wallet: 100, queueRank: 1 })
  make({ number: 'SH10489', customerId: cid('Neha Singh'), placedAt: stamp('2026-10-28', '10:36'), items: [['HL001', 2], ['SH002', 1]], status: 'new', paymentStatus: 'pending', queueRank: 2 })
  make({ number: 'SH10490', customerId: cid('Arjun Patel'), placedAt: stamp('2026-10-28', '10:21'), items: [['HL001', 1], ['SH002', 1], ['GR005', 3]], status: 'new', queueRank: 3 })
  make({ number: 'SH10491', customerId: cid('Meera Nair'), placedAt: stamp('2026-10-28', '10:12'), items: [['GR005', 4], ['PC006', 3]], status: 'new', queueRank: 4 })
  make({ number: 'SH10492', customerId: cid('Rohit Verma'), placedAt: stamp('2026-10-28', '09:55'), items: [['SH002', 1], ['PC003', 1], ['GR005', 4]], status: 'new', queueRank: 5 })
  make({ number: 'SH10493', customerId: cid('Kavya Shah'), placedAt: stamp('2026-10-28', '09:40'), items: [['Organic Turmeric Powder', 1], ['SH002', 1]], status: 'new', paymentStatus: 'pending', queueRank: 6 })

  // ── Delayed orders (6) ──────────────────────────────────────────────────────────────────────────
  const delayAt = (hours) => plusHours(FIXTURE_NOW, -hours)
  make({
    number: 'SH10494',
    customerId: cid('Karan Malhotra'),
    placedAt: delayAt(28),
    items: [['PC006', 10], ['Haldi Kumkum Pooja Pack', 1]],
    status: 'to_pick',
    onHold: true,
    fulfilment: { assignee: 'Pawan Yadav', priority: 'high', pickBatch: 'PICK-2810-04' },
    delay: {
      issue: 'stock_shortage',
      label: 'Stock: PC006 −2',
      detail: 'PC006 Coconut Body Lotion: requested 10, available 8. Shortage: 2 units.',
      ageHours: 28,
      owner: 'Pawan Yadav',
      priority: 'high',
      action: 'wait_for_restock',
      expectedResolutionAt: stamp('2026-10-29', '12:00'),
      note: 'Supplier confirmed 24 units tomorrow.',
    },
    queueRank: 50,
  })
  make({
    number: 'SH10470',
    customerId: cid('Nisha Kapoor'),
    placedAt: delayAt(52 + 30),
    items: [['SH002', 2], ['PC003', 1]],
    status: 'in_transit',
    shipment: { consignmentId: 'EU483920151IN', service: 'Speed Post' },
    delay: { issue: 'shipping_delay', label: 'India Post delay', detail: 'India Post has not scanned the parcel for 52 hours.', ageHours: 52, owner: 'Aman Singh', priority: 'critical', action: 'contact_carrier', expectedResolutionAt: stamp('2026-10-30', '12:00'), note: '' },
    queueRank: 8,
  })
  make({
    number: 'SH10471',
    customerId: cid('Rajesh Gupta'),
    placedAt: delayAt(48),
    items: [['HL001', 3], ['GR005', 2]],
    status: 'new',
    paymentStatus: 'pending',
    delay: { issue: 'payment_pending', label: 'Payment pending', detail: 'The customer has not completed payment.', ageHours: 48, owner: 'Neha Joshi', priority: 'high', action: 'notify_customer', expectedResolutionAt: stamp('2026-10-29', '12:00'), note: '' },
    queueRank: 60,
  })
  make({
    number: 'SH10479',
    customerId: cid('Sonal Mehta'),
    placedAt: delayAt(32),
    items: [['CO004', 1], ['PC003', 1]],
    status: 'new',
    delay: { issue: 'pin_mismatch', label: 'PIN mismatch', detail: 'The PIN code does not match the city on the address.', ageHours: 32, owner: 'Aman Singh', priority: 'medium', action: 'verify_address', expectedResolutionAt: stamp('2026-10-29', '15:00'), note: '' },
    queueRank: 61,
  })
  make({
    number: 'SH10480',
    customerId: cid('Deepak Saini'),
    placedAt: delayAt(30),
    items: [['SH002', 1], ['HL001', 2]],
    status: 'new',
    paymentStatus: 'failed',
    delay: { issue: 'payment_failed', label: 'Payment failed', detail: 'Razorpay reported a failed payment.', ageHours: 30, owner: 'Neha Joshi', priority: 'high', action: 'notify_customer', expectedResolutionAt: stamp('2026-10-29', '12:00'), note: '' },
    queueRank: 62,
  })
  make({
    number: 'SH10481',
    customerId: cid('Priya Iyer'),
    placedAt: delayAt(26 + 20),
    items: [['PC003', 2], ['SH002', 1]],
    status: 'packed',
    weightKg: 1.05,
    delay: { issue: 'pickup_missed', label: 'Pickup missed', detail: 'India Post missed the scheduled pickup.', ageHours: 26, owner: 'Suresh Kumar', priority: 'medium', action: 'reschedule_pickup', expectedResolutionAt: stamp('2026-10-29', '16:30'), note: '' },
    queueRank: 7,
  })

  // ── To Pick (18, 76 units) ─────────────────────────────────────────────────────────────────────
  make({ number: 'SH10500', customerId: 'cus_aditi_2', placedAt: stamp('2026-10-28', '09:10'), items: ADITI_BASKET, status: 'to_pick', wallet: 100, method: 'UPI', fulfilment: { assignee: 'Suresh Kumar', pickBatch: 'PICK-2810-04' }, queueRank: 1 })
  make({ number: 'SH10487', customerId: cid('Vikram Rao'), placedAt: stamp('2026-10-28', '09:02'), items: [['GR005', 1], ['PC003', 1]], status: 'to_pick', fulfilment: { assignee: 'Suresh Kumar', pickBatch: 'PICK-2810-04' }, queueRank: 2 })
  make({ number: 'SH10497', customerId: cid('Arjun Patel'), placedAt: stamp('2026-10-28', '08:50'), items: [['HL001', 1], ['SH002', 1], ['GR005', 3]], status: 'to_pick', fulfilment: { assignee: 'Anjali Singh', priority: 'high', pickBatch: 'PICK-2810-04' }, queueRank: 3 })

  // ── To Pack (12) and ready to dispatch (8) named rows ────────────────────────────────────────────
  make({
    number: 'SH10501',
    customerId: 'cus_aditi_2',
    placedAt: stamp('2026-10-28', '08:20'),
    items: ADITI_BASKET,
    status: 'to_pack',
    wallet: 100,
    method: 'UPI',
    timestamps: { pickedAt: stamp('2026-10-28', '11:15') },
    fulfilment: { assignee: 'Suresh Kumar', pickBatch: 'PICK-2810-03' },
    queueRank: 1,
  })
  make({ number: 'SH10502', customerId: 'cus_aditi_2', placedAt: stamp('2026-10-27', '17:05'), items: ADITI_BASKET, status: 'packed', wallet: 100, method: 'UPI', weightKg: 0.85, queueRank: 1, fulfilment: { packedBy: 'Anjali Singh' } })
  // SH10483 (Rohit Verma) is ready to dispatch too; its queue position is 2.
  make({ number: 'SH10503', customerId: cid('Arjun Patel'), placedAt: stamp('2026-10-27', '15:30'), items: [['HL001', 1], ['SH002', 1], ['GR005', 3]], status: 'packed', weightKg: 1.1, queueRank: 3 })
  make({ number: 'SH10504', customerId: cid('Meera Nair'), placedAt: stamp('2026-10-27', '14:10'), items: [['GR005', 4], ['PC006', 3]], status: 'packed', weightKg: 2.4, queueRank: 4 })
  make({ number: 'SH10495', customerId: cid('Kavya Shah'), placedAt: stamp('2026-10-27', '12:40'), items: [['CO004', 1], ['HL001', 1]], status: 'packed', weightKg: 0.6, queueRank: 5 })
  make({ number: 'SH10496', customerId: cid('Sanya Gupta'), placedAt: stamp('2026-10-27', '11:55'), items: [['SH002', 1], ['PC003', 1]], status: 'packed', weightKg: 0.75, queueRank: 6 })

  // ── Dispatched tab: the seven rows from the design ──────────────────────────────────────────────
  const shipRow = (number, name, consignment, date, status, items, placedDate) =>
    make({
      number,
      customerId: cid(name),
      placedAt: stamp(placedDate, '10:15'),
      items,
      status,
      shipment: { consignmentId: consignment, service: 'Speed Post' },
      timestamps: { dispatchedAt: stamp(date, '16:30') },
    })
  // SH10482 and SH10485 are defined above and keep their positions at the top of the list.
  shipRow('SH10486', 'Meera Nair', 'EU483920198IN', '2026-10-26', 'delivered', [['GR005', 2], ['PC003', 1]], '2026-10-25')
  shipRow('SH10473', 'Kavya Shah', 'EU483920144IN', '2026-10-23', 'returned', [['CO004', 1]], '2026-10-22')
  shipRow('SH10465', 'Ankit Jain', 'EU483920135IN', '2026-10-22', 'delivered', [['HL001', 2], ['SH002', 1]], '2026-10-21')
  shipRow('SH10461', 'Pooja Reddy', 'EU483920127IN', '2026-10-22', 'in_transit', [['PC006', 1], ['PC003', 1]], '2026-10-21')
  shipRow('SH10458', 'Riya Das', 'EU483920113IN', '2026-10-21', 'delivered', [['SH002', 2]], '2026-10-20')

  // ── Generated orders ────────────────────────────────────────────────────────────────────────────
  const buyable = products.filter((product) => product.status === 'active' && product.stock > 20)
  const otherCustomers = customers.filter((customer) => !['cus_aditi', 'cus_aditi_2'].includes(customer.id))
  const randomItems = (count) => {
    const chosen = new Set()
    const items = []
    while (items.length < count) {
      const product = pick(buyable)
      if (chosen.has(product.code)) continue
      chosen.add(product.code)
      items.push([product.code, 1 + Math.floor(random() * 3)])
    }
    return items
  }
  const itemsForUnits = (units) => {
    const items = []
    let left = units
    const chosen = new Set()
    while (left > 0) {
      const product = pick(buyable)
      if (chosen.has(product.code)) continue
      chosen.add(product.code)
      const quantity = Math.min(left, 1 + Math.floor(random() * 3))
      items.push([product.code, quantity])
      left -= quantity
    }
    return items
  }

  let todaySeq = 10512
  const nextToday = () => {
    while (used.has(`SH${todaySeq}`)) todaySeq += 1
    return `SH${todaySeq++}`
  }
  let pastSeq = 10457
  const nextPast = () => {
    while (used.has(`SH${pastSeq}`)) pastSeq -= 1
    return `SH${pastSeq--}`
  }

  // New: 24 total = 10 named so far (10488–10493, 10484, 10471, 10479, 10480) + 14 generated, earlier today.
  for (let index = 0; index < 14; index += 1) {
    make({
      number: nextToday(),
      customerId: pick(otherCustomers).id,
      placedAt: plusHours(stamp('2026-10-28', '09:30'), -(0.2 + index * 0.35)),
      items: randomItems(1 + Math.floor(random() * 3)),
      status: 'new',
      paymentStatus: random() < 0.15 ? 'pending' : 'paid',
      queueRank: 100 + index,
    })
  }

  // To Pick: 18 total = 4 named (10500, 10487, 10497, 10494) + 14 generated with 54 units between them.
  ;[3, 4, 5, 2, 6, 3, 4, 5, 3, 4, 5, 3, 4, 3].forEach((units, index) => {
    make({
      number: nextToday(),
      customerId: pick(otherCustomers).id,
      placedAt: plusHours(stamp('2026-10-28', '08:40'), -(0.3 + index * 0.4)),
      items: itemsForUnits(units),
      status: 'to_pick',
      fulfilment: { assignee: ASSIGNEES[index % 3], pickBatch: 'PICK-2810-04', priority: index === 2 ? 'high' : 'standard' },
      queueRank: 100 + index,
    })
  })

  // To Pack: 12 total = 1 named + 11 generated.
  for (let index = 0; index < 11; index += 1) {
    make({
      number: nextToday(),
      customerId: pick(otherCustomers).id,
      placedAt: plusHours(stamp('2026-10-28', '07:50'), -(0.3 + index * 0.5)),
      items: randomItems(1 + Math.floor(random() * 3)),
      status: 'to_pack',
      timestamps: { pickedAt: plusHours(stamp('2026-10-28', '10:50'), -index * 0.4) },
      fulfilment: { assignee: ASSIGNEES[index % 3], pickBatch: 'PICK-2810-03' },
      queueRank: 100 + index,
    })
  }

  // Ready to dispatch: 8 total = 7 named (10502, 10483, 10503, 10504, 10495, 10496, 10481) + 1 generated (1.20 kg).
  make({ number: nextToday(), customerId: pick(otherCustomers).id, placedAt: stamp('2026-10-27', '10:30'), items: randomItems(2), status: 'packed', weightKg: 1.2, queueRank: 100 })

  // Dispatched in the last 14 days: 148 total = 8 named (10482, 10485, 10486, 10473, 10465, 10461, 10458, 10470) + 140 generated.
  for (let index = 0; index < 140; index += 1) {
    const dayOffset = 1 + (index % 14) // 1..14 days before 28 Oct → 27 Oct … 14 Oct
    const dispatchDay = new Date(Date.UTC(2026, 9, 28 - dayOffset))
    const date = dispatchDay.toISOString().slice(0, 10)
    const dispatchedAt = stamp(date, '16:30')
    const ageDays = dayOffset
    const roll = random()
    let status
    if (ageDays >= 6) status = roll < 0.88 ? 'delivered' : roll < 0.94 ? 'returned' : 'in_transit'
    else if (ageDays >= 3) status = roll < 0.45 ? 'delivered' : 'in_transit'
    else status = roll < 0.3 ? 'dispatched' : 'in_transit'
    make({
      number: nextPast(),
      customerId: pick(otherCustomers).id,
      placedAt: plusHours(dispatchedAt, -(26 + Math.floor(random() * 6))),
      items: randomItems(1 + Math.floor(random() * 3)),
      status,
      timestamps: { dispatchedAt },
      queueRank: 200 + index,
    })
  }

  // History: older delivered orders for other customers (not part of any queue).
  for (let index = 0; index < 70; index += 1) {
    const daysBack = 16 + Math.floor(random() * 80)
    const date = new Date(Date.UTC(2026, 9, 28 - daysBack)).toISOString().slice(0, 10)
    make({
      number: nextPast(),
      customerId: pick(otherCustomers).id,
      placedAt: stamp(date, '13:10'),
      items: randomItems(1 + Math.floor(random() * 3)),
      status: random() < 0.04 ? 'cancelled' : 'delivered',
      timestamps: { dispatchedAt: stamp(date, '17:00') },
      queueRank: 500 + index,
    })
  }

  return orders
}
