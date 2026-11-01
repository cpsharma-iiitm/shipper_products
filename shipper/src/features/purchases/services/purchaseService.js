import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team: every path, payload and response below. A "purchase" is an
// assisted purchase an admin creates for a customer (design p-14), not a supplier purchase order.
//
// GET  /admin/purchases?page&pageSize&q&status=all|draft|payment_pending|paid|cancelled&sort=[-]createdAt|grossAmount|customerName
//      → { items: [{ purchaseNumber, status, customerCode, customerName, createdAt, createdBy, products,
//          units, grossAmount, payable, paymentLabel, reference }], page, pageSize, totalItems, pageCount,
//          statusOptions: [{ value, label }] }
// GET  /admin/purchases/draft → { purchaseNumber, createdBy, paymentMethods: [{ value, label, collectLabel }] }
// GET  /admin/purchases/:purchaseNumber → Purchase (below), used to resume a draft
// GET  /admin/purchases/customers?q= → { items: Customer[] }
//      Customer = { code, name, mobile, email, walletBalance, addresses: [{ id, label, name, mobile, line1,
//                   line2, landmark, city, state, pin, isDefault, verified }] }
// GET  /admin/purchases/products → { items: [{ code, name, unit, stock }] } (products that can be sold now)
// POST /admin/purchases/quote { customerCode, addressId, lines: [{ productCode, quantity }], useWallet } → Quote
//      Quote = { lines: [{ productCode, name, unit, quantity, pv, linePv, mrp, unitPrice, gstPercent, lineTotal,
//                          availableStock, maxQuantity, available }],
//                summary: { products, units, totalPv, itemsTotal, taxableSubtotal, gstTotal, cgst, sgst, igst,
//                           gstType: 'intra_state' | 'inter_state', gstStateCode, shipping, grossAmount,
//                           couponDiscount, walletApplied, payable },
//                wallet: { balance, eligible, applicable, applied, balanceAfter },
//                delivery: { addressId, pin, city, state, serviceable, gstStateCode, supply },
//                availability: { allAvailable, message } }
//      Every amount, tax split and availability flag is calculated by the backend.
// POST /admin/purchases { action: 'draft' | 'submit', purchaseNumber, customerCode, addressId, lines, useWallet,
//      paymentMethod } → Purchase = { purchaseNumber, status, customer, address, lines, summary, wallet,
//      delivery, useWallet, paymentMethod, paymentLabel, collectLabel, reference, createdAt, createdBy }
//      "submit" raises the payment request through the payment provider (Razorpay) on the backend.
// POST /admin/purchases/:purchaseNumber/cancel → the cancelled list item

export async function listPurchases(params) {
  const { data } = await http.get(endpoints.admin.purchases.list, { params })
  return data
}

export async function getPurchaseDraft() {
  const { data } = await http.get(endpoints.admin.purchases.draft)
  return data
}

export async function getPurchase(purchaseNumber) {
  const { data } = await http.get(endpoints.admin.purchases.item(purchaseNumber))
  return data
}

export async function findCustomers(q) {
  const { data } = await http.get(endpoints.admin.purchases.customers, { params: { q } })
  return data.items
}

export async function listSellableProducts() {
  const { data } = await http.get(endpoints.admin.purchases.productOptions)
  return data.items
}

export async function getPurchaseQuote(request) {
  const { data } = await http.post(endpoints.admin.purchases.quote, request)
  return data
}

export async function savePurchase(payload) {
  const { data } = await http.post(endpoints.admin.purchases.list, payload)
  return data
}

export async function cancelPurchase(purchaseNumber) {
  const { data } = await http.post(endpoints.admin.purchases.cancel(purchaseNumber))
  return data
}
