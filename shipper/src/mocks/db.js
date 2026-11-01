// DEV FIXTURES — the in-memory "database" behind the mock API.
//
// Built once when the mock API is first imported and mutated by the mock handlers (adding to a cart
// does not touch it, placing an order, verifying or dispatching one does). A page reload resets it.
// Nothing here is persistent or production-ready; every shape is an ASSUMPTION — confirm with backend team.
import { productImage } from '@/mocks/assets'
import { buildCatalogData, CATEGORY_META, CATEGORY_ORDER } from '@/mocks/fixtures/catalogData'
import { buildAddresses, buildCustomers, WALLET_TRANSACTIONS } from '@/mocks/fixtures/customersData'
import { buildOrders } from '@/mocks/fixtures/ordersData'
import { demoUsers } from '@/mocks/fixtures/users'

const products = buildCatalogData().map((product) => ({
  ...product,
  image: productImage(product.imageKey),
  thumbnail: productImage(product.thumbnailKey),
  gallery: product.galleryKeys.map(productImage),
}))

const categories = CATEGORY_ORDER.map((slug) => ({
  slug,
  name: CATEGORY_META[slug].name,
  description: CATEGORY_META[slug].description,
  image: productImage(CATEGORY_META[slug].tile),
}))

const customers = buildCustomers()
const addresses = buildAddresses(customers)

export const db = {
  /** Login accounts (storefront customers and admins). Signed-up accounts are appended at runtime. */
  accounts: demoUsers.map((user) => ({ ...user })),
  products,
  categories,
  customers,
  /** { [customerId]: Address[] } */
  addresses,
  walletTransactions: WALLET_TRANSACTIONS.map((transaction) => ({ ...transaction })),
  /** { [customerId]: string[] } product codes saved for later (the "Saved products" page) */
  savedProducts: { cus_aditi: ['PC006', 'CO004', 'GR005'] },
  orders: buildOrders({ products, customers, addresses }),
}

// ── Lookups ─────────────────────────────────────────────────────────────────────────────────────────
export const getProduct = (code) => db.products.find((product) => product.code === code) ?? null
export const getProductBySlug = (slug) => db.products.find((product) => product.slug === slug) ?? null
export const getCustomer = (id) => db.customers.find((customer) => customer.id === id) ?? null
export const getCustomerByCode = (code) => db.customers.find((customer) => customer.code === code) ?? null
export const getOrder = (orderNumber) => db.orders.find((order) => order.orderNumber === orderNumber) ?? null
export const ordersOfCustomer = (customerId) => db.orders.filter((order) => order.customerId === customerId)

/**
 * The customer record behind a signed-in storefront user. Accounts created through sign-up get a
 * customer record the first time they are needed.
 */
export function ensureCustomer(user) {
  let customer = getCustomer(user.id)
  if (!customer) {
    const highest = Math.max(...db.customers.map((entry) => Number(entry.code.replace('CUS', ''))))
    customer = {
      id: user.id,
      code: `CUS${String(highest + 1).padStart(5, '0')}`,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      city: '',
      state: '',
      pin: '',
      ordersCount: 0,
      totalSpend: 0,
      walletBalance: 0,
      status: 'active',
      joinedAt: new Date().toISOString(),
    }
    db.customers.push(customer)
    db.addresses[user.id] = []
  }
  return customer
}

export const walletBalanceOf = (customerId) => getCustomer(customerId)?.walletBalance ?? 0

/** Next free order number: SH10xxx counting up from the highest existing one. */
export function nextOrderNumber() {
  const highest = Math.max(...db.orders.map((order) => Number(order.orderNumber.slice(2))))
  return `SH${highest + 1}`
}

/** Adds the product thumbnail and slug to each order line, for views that show pictures. */
export function withLineImages(order) {
  return {
    ...order,
    lines: order.lines.map((line) => {
      const product = getProduct(line.productCode)
      return { ...line, slug: product?.slug ?? null, image: product?.thumbnail ?? null }
    }),
  }
}
