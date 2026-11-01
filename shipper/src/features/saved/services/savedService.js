import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. A saved product summary is
//   { productCode, slug, name, unit, category, categoryLabel, image, mrp, sellingPrice, discountPercent,
//     stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock', savedAt }
// Saving is idempotent (PUT), removing too (DELETE).

export async function listSavedProducts() {
  const { data } = await http.get(endpoints.savedProducts.list)
  return data.items
}

export async function saveProduct(productCode) {
  await http.put(endpoints.savedProducts.item(productCode))
}

export async function unsaveProduct(productCode) {
  await http.delete(endpoints.savedProducts.item(productCode))
}
