import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team: every path, query parameter, payload and response below.
//
// GET  /admin/products?page&pageSize&q&category&stock=all|in|low|out&status=all|active|inactive&sort=[-]field
//      → { items: Product[], page, pageSize, totalItems, pageCount,
//          counts: { all, active, low, out }, stock: { updatedAt, warehouse } }
//      Product = { code, slug, name, category, categoryLabel, unit, batch, hsn, gstPercent, stock,
//                  lowStockThreshold, pv, mrp, sellingPrice, discountPercent, status: 'active' | 'inactive',
//                  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock', image, thumbnail, description,
//                  updatedAt, updatedBy }
//      `counts`, `stockStatus` and `discountPercent` are calculated by the backend.
// GET  /admin/products/options → { categories: [{ value, label }], units: string[], gstRates: number[] }
// GET  /admin/products/export  (same filters, no paging) → { generatedAt, items: Product[] }
// POST /admin/products | PUT /admin/products/:code → Product; field errors arrive as 422 { message, errors: { field: message } }
// POST /admin/products/:code/image (multipart, field "image": JPG or PNG up to 5 MB) → Product
// DELETE /admin/products/:code → 204
// POST /admin/products/bulk-update { scope: { codes } | { filters }, changes: { status?, gstPercent? } } → { updated }
// POST /admin/products/import { rows } → { created, updated, rejected: [{ rowNumber, code, message }] }

export async function listProducts(params) {
  const { data } = await http.get(endpoints.admin.products.list, { params })
  return data
}

export async function getProductOptions() {
  const { data } = await http.get(endpoints.admin.products.options)
  return data
}

export async function exportProducts(params) {
  const { data } = await http.get(endpoints.admin.products.export, { params })
  return data
}

export async function createProduct(payload) {
  const { data } = await http.post(endpoints.admin.products.list, payload)
  return data
}

export async function updateProduct(code, payload) {
  const { data } = await http.put(endpoints.admin.products.item(code), payload)
  return data
}

export async function uploadProductImage(code, file) {
  const body = new FormData()
  body.append('image', file)
  const { data } = await http.post(endpoints.admin.products.image(code), body)
  return data
}

export async function deleteProduct(code) {
  await http.delete(endpoints.admin.products.item(code))
}

export async function bulkUpdateProducts(payload) {
  const { data } = await http.post(endpoints.admin.products.bulkUpdate, payload)
  return data
}

export async function importProducts(rows) {
  const { data } = await http.post(endpoints.admin.products.import, { rows })
  return data
}
