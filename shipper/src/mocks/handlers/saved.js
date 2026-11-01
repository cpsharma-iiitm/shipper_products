// DEV FIXTURES — saved products of the signed-in customer for the mock API.
// ASSUMPTION — confirm with backend team: paths and payloads (see features/saved/services).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getProduct } from '@/mocks/db'
import { requireUser } from '@/mocks/lib/auth'

const stockStatusOf = (product) =>
  product.status !== 'active' || product.stock <= 0 ? 'out_of_stock' : product.stock <= product.lowStockThreshold ? 'low_stock' : 'in_stock'

function savedCodes(headers) {
  const user = requireUser(headers)
  return (db.savedProducts[user.id] ??= [])
}

export const savedHandlers = [
  defineHandler('get', '/saved-products', ({ headers }) => {
    const items = savedCodes(headers)
      .map((productCode, index) => ({ product: getProduct(productCode), index }))
      .filter(({ product }) => product)
      .map(({ product, index }) => ({
        productCode: product.code,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        category: product.category,
        categoryLabel: product.categoryLabel,
        image: product.thumbnail,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice,
        discountPercent: product.discountPercent,
        stockStatus: stockStatusOf(product),
        // Newest first: later entries in the list were saved later.
        savedAt: new Date(Date.parse('2026-10-20T10:00:00+05:30') + index * 3_600_000).toISOString(),
      }))
      .reverse()
    return { data: { items } }
  }),

  defineHandler('put', '/saved-products/:productCode', ({ params, headers }) => {
    if (!getProduct(params.productCode)) throw new MockHttpError(404, 'Product not found.')
    const codes = savedCodes(headers)
    if (!codes.includes(params.productCode)) codes.push(params.productCode)
    return { status: 204 }
  }),

  defineHandler('delete', '/saved-products/:productCode', ({ params, headers }) => {
    const codes = savedCodes(headers)
    const index = codes.indexOf(params.productCode)
    if (index !== -1) codes.splice(index, 1)
    return { status: 204 }
  }),
]
