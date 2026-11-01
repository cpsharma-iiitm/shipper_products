import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. A restock item is a product at or below its reorder level:
//   { productCode, name, unit, category, categoryLabel, thumbnail, bin, stock, lowStockThreshold,
//     level: 'low' | 'out', suggestedQuantity, requestedQuantity }
// `suggestedQuantity` is the backend's reorder recommendation; the browser never works it out.

/**
 * GET restock items (q: code or name · category: slug · level: low | out · sort: 'field' | '-field' · page · pageSize) →
 *   { items, page, pageSize, totalItems, pageCount, counts: { all, low, out } }
 * Without `sort` the backend lists out-of-stock products first, then the emptiest shelves.
 * `counts` ignore the `level` filter so the summary cards stay stable.
 */
export async function listRestockItems(params) {
  const { data } = await http.get(endpoints.admin.restock.list, { params })
  return data
}

/**
 * POST a restock request for one or more products: { items: [{ productCode, quantity }] } →
 *   { id, status: 'requested', requestedAt, items }
 * ASSUMPTION — confirm with backend team: restock is raised as a request that the purchasing team (outside this
 * app) turns into a supplier order. Listed items then carry `requestedQuantity` until the stock arrives.
 */
export async function createRestockRequest(items) {
  const { data } = await http.post(endpoints.admin.restock.requests, { items })
  return data
}
