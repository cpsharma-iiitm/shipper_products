export const endpoints = {
  catalog: {
    list: '/catalog',
    detail: '/catalog/:id',
    offers: '/catalog/offers',
  },
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
  },
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: '/cart/items/:id',
    remove: '/cart/items/:id',
  },
  orders: {
    list: '/orders',
    detail: '/orders/:id',
    checkout: '/orders/checkout',
  },
  account: {
    profile: '/account/profile',
    addresses: '/account/addresses',
    wallet: '/account/wallet',
  },
  admin: {
    dashboard: '/admin/dashboard',
    products: '/admin/products',
    orders: '/admin/orders',
    customers: '/admin/customers',
    reports: '/admin/reports',
  },
};
