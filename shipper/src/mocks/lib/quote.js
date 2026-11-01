// DEV FIXTURES — the pricing rules of the *fake* backend.
//
// The frontend never calculates prices, GST, shipping, wallet deductions or totals. This module
// stands in for the backend so the mock API can answer quote and order requests with plausible,
// internally consistent numbers (they reproduce the cart in the design: ₹760 items, ₹669.25
// taxable, ₹90.75 GST, ₹40 shipping, ₹800 gross, ₹100 wallet, ₹700 to pay).
//
// Every rule below is an ASSUMPTION — confirm with backend team:
//  - catalogue prices are GST-inclusive; taxable value and GST are derived per line and rounded to paise
//  - shipping is a flat ₹40, free when the items total reaches ₹999
//  - GST is split into CGST + SGST for deliveries inside Uttar Pradesh (state code 09), IGST elsewhere
//  - a wallet can pay up to ₹100 per order, and cannot be combined with a coupon
export const SHIPPING_FLAT_FEE = 40
export const FREE_SHIPPING_THRESHOLD = 999
export const WALLET_ORDER_CAP = 100
export const ORIGIN_STATE = 'Uttar Pradesh'
export const ORIGIN_STATE_CODE = '09'

export const COUPONS = {
  HELLO10: {
    code: 'HELLO10',
    description: '10% off your first order, up to ₹100 off (minimum ₹699).',
    percent: 10,
    cap: 100,
    minItemsTotal: 699,
    firstOrderOnly: true,
  },
  SHIPPER50: {
    code: 'SHIPPER50',
    description: '₹50 off orders of ₹499 or more.',
    flat: 50,
    minItemsTotal: 499,
    firstOrderOnly: false,
  },
}

export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100

/**
 * @param {object} input
 * @param {{product: object, quantity: number}[]} input.lines  product = catalogue record
 * @param {string} [input.destinationState]  state of the delivery address (decides CGST+SGST vs IGST)
 * @param {boolean} [input.useWallet]
 * @param {number} [input.walletBalance]
 * @param {string} [input.couponCode]
 * @param {boolean} [input.hasPriorOrders]
 */
export function computeQuote({ lines, destinationState = ORIGIN_STATE, useWallet = false, walletBalance = 0, couponCode, hasPriorOrders = true }) {
  const quoteLines = lines.map(({ product, quantity }) => {
    const lineTotal = round2(product.sellingPrice * quantity)
    const taxable = round2(lineTotal / (1 + product.gstPercent / 100))
    const gst = round2(lineTotal - taxable)
    const available = product.stock
    const stockStatus = product.status !== 'active' || available <= 0 ? 'out_of_stock' : available <= product.lowStockThreshold ? 'low_stock' : 'in_stock'
    return {
      productCode: product.code,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      category: product.category,
      quantity,
      unitPrice: product.sellingPrice,
      mrp: product.mrp,
      discountPercent: product.discountPercent,
      gstPercent: product.gstPercent,
      hsn: product.hsn,
      batch: product.batch,
      pv: product.pv,
      taxable,
      gst,
      lineTotal,
      stockStatus,
      availableStock: available,
      lowStockLeft: stockStatus === 'low_stock' ? available : null,
      maxQuantity: Math.max(0, Math.min(10, available)),
    }
  })

  const units = quoteLines.reduce((total, line) => total + line.quantity, 0)
  const itemsTotal = round2(quoteLines.reduce((total, line) => total + line.lineTotal, 0))
  const taxableSubtotal = round2(quoteLines.reduce((total, line) => total + line.taxable, 0))
  const gstTotal = round2(quoteLines.reduce((total, line) => total + line.gst, 0))
  const shipping = itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_FEE
  const grossAmount = round2(itemsTotal + shipping)

  const intraState = destinationState === ORIGIN_STATE
  const cgst = intraState ? round2(gstTotal / 2) : 0
  const sgst = intraState ? round2(gstTotal - cgst) : 0
  const igst = intraState ? 0 : gstTotal

  // Coupon
  let coupon = null
  let couponDiscount = 0
  if (couponCode) {
    const definition = COUPONS[String(couponCode).trim().toUpperCase()]
    if (!definition) {
      coupon = { code: String(couponCode).trim().toUpperCase(), valid: false, message: 'This coupon code is not valid.' }
    } else if (definition.firstOrderOnly && hasPriorOrders) {
      coupon = { code: definition.code, valid: false, message: `${definition.code} is valid on your first order only.` }
    } else if (itemsTotal < definition.minItemsTotal) {
      coupon = { code: definition.code, valid: false, message: `Add items worth ₹${definition.minItemsTotal} or more to use ${definition.code}.` }
    } else {
      couponDiscount = definition.percent ? Math.min(definition.cap, round2((itemsTotal * definition.percent) / 100)) : definition.flat
      coupon = { code: definition.code, valid: true, message: `${definition.code} applied.`, discount: couponDiscount }
    }
  }

  // Wallet cannot be combined with a coupon.
  const walletEligible = !coupon?.valid
  const walletApplied = useWallet && walletEligible ? round2(Math.min(walletBalance, WALLET_ORDER_CAP, grossAmount)) : 0
  const payable = round2(grossAmount - couponDiscount - walletApplied)
  const awayFromFreeShipping = itemsTotal > 0 && itemsTotal < FREE_SHIPPING_THRESHOLD ? round2(FREE_SHIPPING_THRESHOLD - itemsTotal) : null

  return {
    lines: quoteLines,
    summary: {
      products: quoteLines.length,
      units,
      itemsTotal,
      taxableSubtotal,
      gstTotal,
      cgst,
      sgst,
      igst,
      gstType: intraState ? 'intra_state' : 'inter_state',
      gstStateCode: ORIGIN_STATE_CODE,
      shipping,
      grossAmount,
      couponDiscount,
      walletApplied,
      payable,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      awayFromFreeShipping,
    },
    wallet: {
      balance: walletBalance,
      eligible: walletEligible,
      maxPerOrder: WALLET_ORDER_CAP,
      applied: walletApplied,
      balanceAfter: round2(walletBalance - walletApplied),
    },
    coupon,
  }
}
