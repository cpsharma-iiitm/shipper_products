// Saved delivery addresses of the signed-in customer (profile, checkout).
// ASSUMPTION — confirm with backend team: all paths, methods and payload shapes.
export const addressEndpoints = {
  addresses: {
    list: '/addresses',
    item: (id) => `/addresses/${id}`,
    setDefault: (id) => `/addresses/${id}/default`,
  },
}