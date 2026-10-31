// Admin dashboard, products, purchases and profile endpoints (merged into `endpoints.admin`).
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
export const adminCoreEndpoints = {
  notifications: '/admin/notifications',
  dashboard: {
    summary: '/admin/dashboard',
  },
  products: {
    list: '/admin/products',
    options: '/admin/products/options',
    export: '/admin/products/export',
    bulkUpdate: '/admin/products/bulk-update',
    import: '/admin/products/import',
    item: (code) => `/admin/products/${code}`,
    image: (code) => `/admin/products/${code}/image`,
  },
  purchases: {
    list: '/admin/purchases',
    draft: '/admin/purchases/draft',
    quote: '/admin/purchases/quote',
    customers: '/admin/purchases/customers',
    productOptions: '/admin/purchases/products',
    item: (purchaseNumber) => `/admin/purchases/${purchaseNumber}`,
    cancel: (purchaseNumber) => `/admin/purchases/${purchaseNumber}/cancel`,
  },
  profile: {
    me: '/admin/profile',
    password: '/admin/profile/password',
  },
}