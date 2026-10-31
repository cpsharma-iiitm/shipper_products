// Products a signed-in customer has saved for later (heart icon, "Saved products" page).
// ASSUMPTION — confirm with backend team: all paths, methods and payload shapes.
export const savedEndpoints = {
  savedProducts: {
    list: '/saved-products',
    item: (productCode) => `/saved-products/${productCode}`,
  },
}