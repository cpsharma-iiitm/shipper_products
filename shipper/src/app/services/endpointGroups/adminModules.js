// Admin reports, customers, users, roles, orders and restock endpoints (merged into `endpoints.admin`).
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
// Invoice and label downloads are shared and live in `endpoints.documents`.
export const adminModuleEndpoints = {
  reports: {
    overview: '/admin/reports/overview',
    financial: '/admin/reports/financial',
    financialOrder: (orderNumber) => `/admin/reports/financial/orders/${orderNumber}`,
  },
  customers: {
    list: '/admin/customers',
    options: '/admin/customers/options',
    item: (code) => `/admin/customers/${code}`,
  },
  users: {
    list: '/admin/users',
    item: (id) => `/admin/users/${id}`,
    status: (id) => `/admin/users/${id}/status`,
  },
  roles: {
    list: '/admin/roles',
    item: (id) => `/admin/roles/${id}`,
  },
  orders: {
    list: '/admin/orders',
    item: (orderNumber) => `/admin/orders/${orderNumber}`,
    cancel: (orderNumber) => `/admin/orders/${orderNumber}/cancel`,
  },
  restock: {
    list: '/admin/restock',
    requests: '/admin/restock/requests',
  },
}