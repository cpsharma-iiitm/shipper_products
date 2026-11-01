import { paths } from '@/app/router/paths'

// ASSUMPTION — confirm with backend team (B-10): which items each role may see. Until roles are
// defined every signed-in admin sees the full menu; the backend still authorises each request.
export const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid', to: paths.admin.dashboard },
  { key: 'purchases', label: 'Purchase', icon: 'cart', to: paths.admin.purchases },
  { key: 'orders', label: 'Orders', icon: 'clipboard-check', to: paths.admin.orders },
  { key: 'products', label: 'Products', icon: 'box-seam', to: paths.admin.products },
  { key: 'reports', label: 'Reports', icon: 'bar-chart-line', to: paths.admin.reports },
  { key: 'customers', label: 'Customers', icon: 'people', to: paths.admin.customers },
  { key: 'users', label: 'Users', icon: 'person-gear', to: paths.admin.users },
  { key: 'roles', label: 'User Roles', icon: 'shield-check', to: paths.admin.roles },
  { key: 'store-operation', label: 'Store Operation', icon: 'building', to: paths.admin.storeOperation },
  { key: 'shipping', label: 'Shipping', icon: 'truck', to: paths.admin.shipping },
  { key: 'restock', label: 'Order Restock', icon: 'boxes', to: paths.admin.restock },
  { key: 'profile', label: 'Profile', icon: 'person', to: paths.admin.profile },
]
