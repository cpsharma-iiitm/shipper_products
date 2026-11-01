import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team (A-01 … A-06). The catalogue is read-only for customers and
// only ever returns active products.
//
// Product summary (list items, cards, related products):
//   { code, slug, name, unit, category, categoryLabel, image, mrp, sellingPrice, discountPercent, rating,
//     reviewCount, badge, walletRewards, purchaseLimit, stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock',
//     lowStockLeft }
// `stockStatus`, `lowStockLeft` and `purchaseLimit` are decided by the backend; the UI never derives
// availability from stock numbers.

const omitEmpty = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false))

/**
 * Paged, filtered catalogue.
 * Params: q, category, collection, minPrice, maxPrice, inStock, minDiscount, minRating, walletRewards,
 *   sort ('recommended' | 'price_asc' | 'price_desc' | 'discount' | 'newest'), page, pageSize.
 * Response: { items[], page, pageSize, totalItems, pageCount,
 *   facets: { categories: [{ slug, name, count }], priceBounds: { min, max } } }
 * Facet counts ignore the category filter and the price bounds ignore the price filter, so the filter
 * panel keeps offering the choices the customer just narrowed away.
 */
export async function listProducts(params) {
  const { data } = await http.get(endpoints.catalog.products, { params: omitEmpty(params) })
  return data
}

/** Categories with active product counts: { items: [{ slug, name, description, image, productCount }] } */
export async function listCategories() {
  const { data } = await http.get(endpoints.catalog.categories)
  return data.items
}

/**
 * Product detail: the summary fields plus { tagline, description, ingredients, netQuantity, batch, bestBefore,
 *   hsn, gstPercent, storage, packedBy, careNote, availableQuantity, savings, gallery: [{ url, alt }],
 *   variants: [{ code, slug, unit, mrp, sellingPrice, stockStatus, isCurrent }],
 *   reviews: { average, count, highlights: [{ quote, author, reviewedAt, verified }] } }.
 * `savings` (MRP minus selling price) is calculated by the backend. 404 for unknown or inactive products.
 */
export async function getProduct(slug) {
  const { data } = await http.get(endpoints.catalog.product(slug))
  return data
}

/** Complementary products for a product page: { items: [summary] } */
export async function listRelatedProducts(slug) {
  const { data } = await http.get(endpoints.catalog.related(slug))
  return data.items
}

/**
 * Coupons and free-shipping rule shown on the offers page. Display only: the cart quote decides what
 * actually applies.
 * Response: { coupons: [{ code, title, description, maxDiscount, minOrderValue, firstOrderOnly }], freeShippingThreshold }
 */
export async function getOffers() {
  const { data } = await http.get(endpoints.catalog.offers)
  return data
}

/** Newsletter sign-up. Request: { email }. Response 201: { email, status: 'subscribed' }. 422 for an invalid address. */
export async function subscribeToNewsletter(email) {
  const { data } = await http.post(endpoints.catalog.newsletter, { email })
  return data
}
