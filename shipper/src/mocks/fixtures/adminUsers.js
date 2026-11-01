// DEV FIXTURES — admin users, roles and the permission modules (pure data builders).
//
// Roles and permissions are display and editing UI only: nothing here authorises anything. Authorization
// is backend work (the backend checks every request against the signed-in user's role).
// ASSUMPTION — confirm with backend team: the module list, the access levels ('none' | 'read' | 'write',
// where write includes read) and the role names.

export const PERMISSION_MODULES = [
  { key: 'dashboard', group: 'Insights', label: 'Dashboard', description: 'Sales, orders and stock overview' },
  { key: 'reports', group: 'Insights', label: 'Reports', description: 'Reports, financial report and Excel exports' },
  { key: 'orders', group: 'Sales', label: 'Orders', description: 'Order list, order details and cancellations' },
  { key: 'customers', group: 'Sales', label: 'Customers', description: 'Customer profiles, wallet and addresses' },
  { key: 'products', group: 'Catalogue and stock', label: 'Products', description: 'Product catalogue, pricing and status' },
  { key: 'purchases', group: 'Catalogue and stock', label: 'Purchases', description: 'Purchase orders and stock intake' },
  { key: 'restock', group: 'Catalogue and stock', label: 'Order restock', description: 'Low and out-of-stock alerts' },
  { key: 'store_operation', group: 'Fulfilment', label: 'Store operation', description: 'Verify, pick, pack and dispatch orders' },
  { key: 'shipping', group: 'Fulfilment', label: 'Shipping', description: 'Shipments, labels and tracking' },
  { key: 'users', group: 'Administration', label: 'Users', description: 'Admin users and their status' },
  { key: 'roles', group: 'Administration', label: 'User roles', description: 'Roles and their permissions' },
]

const levels = (read = [], write = []) =>
  Object.fromEntries(PERMISSION_MODULES.map(({ key }) => [key, write.includes(key) ? 'write' : read.includes(key) ? 'read' : 'none']))

export function buildRoles() {
  return [
    {
      id: 'role_administrator',
      name: 'Administrator',
      description: 'Full access to every module, including users and roles.',
      system: true,
      permissions: levels([], PERMISSION_MODULES.map((module) => module.key)),
      updatedAt: '2026-08-01T10:00:00+05:30',
    },
    {
      id: 'role_store_manager',
      name: 'Store Manager',
      description: 'Runs the warehouse day to day: orders, catalogue, stock and fulfilment.',
      system: false,
      permissions: levels(['dashboard', 'reports', 'customers', 'users'], ['orders', 'products', 'purchases', 'restock', 'store_operation', 'shipping']),
      updatedAt: '2026-09-12T15:20:00+05:30',
    },
    {
      id: 'role_warehouse',
      name: 'Warehouse Picker/Packer',
      description: 'Picks, packs and dispatches orders from the Store Operation screens.',
      system: false,
      permissions: levels(['orders', 'products', 'restock', 'shipping'], ['store_operation']),
      updatedAt: '2026-09-12T15:24:00+05:30',
    },
    {
      id: 'role_support',
      name: 'Support',
      description: 'Helps customers with orders, deliveries and wallet questions.',
      system: false,
      permissions: levels(['dashboard', 'products', 'store_operation', 'shipping'], ['orders', 'customers']),
      updatedAt: '2026-10-02T11:05:00+05:30',
    },
    {
      id: 'role_finance',
      name: 'Finance',
      description: 'Reports, GST and purchase payments.',
      system: false,
      permissions: levels(['dashboard', 'orders', 'customers', 'products'], ['reports', 'purchases']),
      updatedAt: '2026-10-02T11:12:00+05:30',
    },
  ]
}

const user = (id, name, roleId, status, lastActiveAt, createdAt, mobile) => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@shipper.com`,
  mobile,
  roleId,
  status,
  lastActiveAt,
  createdAt,
})

export function buildUsers() {
  return [
    user('adm_pawan', 'Pawan Yadav', 'role_administrator', 'active', '2026-10-28T11:20:00+05:30', '2026-08-01T10:00:00+05:30', '9811122334'),
    user('adm_aman', 'Aman Singh', 'role_store_manager', 'active', '2026-10-28T10:58:00+05:30', '2026-08-04T10:30:00+05:30', '9811100245'),
    user('adm_vikas', 'Vikas Bhatia', 'role_store_manager', 'active', '2026-10-27T18:12:00+05:30', '2026-08-18T09:15:00+05:30', '9811100318'),
    user('adm_neha', 'Neha Joshi', 'role_support', 'active', '2026-10-28T10:40:00+05:30', '2026-08-20T11:00:00+05:30', '9811100427'),
    user('adm_suresh', 'Suresh Kumar', 'role_warehouse', 'active', '2026-10-28T09:52:00+05:30', '2026-08-25T08:45:00+05:30', '9811100536'),
    user('adm_anjali', 'Anjali Singh', 'role_warehouse', 'active', '2026-10-28T09:47:00+05:30', '2026-08-25T08:50:00+05:30', '9811100645'),
    user('adm_farah', 'Farah Khan', 'role_warehouse', 'active', '2026-10-28T09:41:00+05:30', '2026-09-08T09:00:00+05:30', '9811100754'),
    user('adm_ritu', 'Ritu Malhotra', 'role_finance', 'active', '2026-10-26T17:30:00+05:30', '2026-09-02T14:10:00+05:30', '9811100863'),
    user('adm_kiran', 'Kiran Rao', 'role_support', 'inactive', '2026-10-02T12:05:00+05:30', '2026-08-22T10:20:00+05:30', ''),
    user('adm_mehul', 'Mehul Shah', 'role_finance', 'inactive', '2026-09-14T16:48:00+05:30', '2026-08-30T10:05:00+05:30', ''),
  ]
}
