// DEV FIXTURES — low and out-of-stock list for the mock API.
// ASSUMPTION — confirm with backend team: the path, query parameters, payload and the reorder-quantity rule.
// The suggested quantity is a backend decision; the rule here (about three times the reorder level, in packs
// of six) is only a stand-in so the screen has realistic numbers to show.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { requireAdmin } from '@/mocks/lib/auth'
import { matchesText, sortBy } from '@/mocks/lib/paginate'
import { listResponse } from './shared'
 
const PACK_SIZE = 6
 
/** Open restock requests raised during this session (resets on reload): [{ id, requestedAt, items }]. */
const requests = []
const requestedQuantity = (productCode) =>
  requests.reduce((total, request) => total + (request.items.find((item) => item.productCode === productCode)?.quantity ?? 0), 0)
 
const levelOf = (product) => (product.stock === 0 ? 'out' : 'low')
 
const suggestedQuantity = (product) => Math.ceil((product.lowStockThreshold * 3 - product.stock) / PACK_SIZE) * PACK_SIZE
 
const toItem = (product) => ({
  productCode: product.code,
  name: product.name,
  unit: product.unit,
  category: product.category,
  categoryLabel: product.categoryLabel,
  thumbnail: product.thumbnail,
  bin: product.bin,
  stock: product.stock,
  lowStockThreshold: product.lowStockThreshold,
  level: levelOf(product),
  suggestedQuantity: suggestedQuantity(product),
  requestedQuantity: requestedQuantity(product.code),
})
 
// Out of stock first, then the emptiest shelves.
const byUrgency = (a, b) => (a.level === b.level ? a.stock - b.stock : a.level === 'out' ? -1 : 1)
 
function buildList(query) {
  const base = db.products
    .filter((product) => product.stock <= product.lowStockThreshold)
    .map(toItem)
    .filter((item) => (!query.category || item.category === query.category) && matchesText(query.q, item.productCode, item.name))
  const counts = { all: base.length, low: base.filter((item) => item.level === 'low').length, out: base.filter((item) => item.level === 'out').length }
  const rows = base.filter((item) => !query.level || item.level === query.level)
  const sorted = query.sort ? sortBy(rows, query.sort) : [...rows].sort(byUrgency)
  return listResponse(sorted, query, { counts }, 12)
}
 
export const restockHandlers = [
  defineHandler('get', '/admin/restock', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildList(query) }
  }),
 
  defineHandler('post', '/admin/restock/requests', ({ body, headers }) => {
    requireAdmin(headers)
    const items = (body?.items ?? []).map((item) => ({ productCode: item.productCode, quantity: Math.floor(Number(item.quantity)) }))
    if (items.length === 0 || items.some((item) => !getProduct(item.productCode) || !(item.quantity >= 1))) {
      throw new MockHttpError(422, 'Choose at least one product and a whole-number quantity of 1 or more.')
    }
    const request = { id: `RST-${String(requests.length + 1).padStart(4, '0')}`, status: 'requested', requestedAt: FIXTURE_NOW, items }
    requests.push(request)
    return { status: 201, data: request }
  }),
]
