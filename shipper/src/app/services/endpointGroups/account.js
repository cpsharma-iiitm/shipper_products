// Customer account, wallet, order history and shipment tracking endpoints.
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
export const accountEndpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    mobileAvailability: '/auth/mobile-availability',
  },
  account: {
    profile: '/account/profile',
    password: '/account/password',
    wallet: '/account/wallet',
    walletTransactions: '/account/wallet/transactions',
  },
  orders: {
    list: '/orders',
    detail: (orderNumber) => `/orders/${orderNumber}`,
    // Public lookup (no sign-in): the order number plus the customer's mobile, or a consignment ID.
    track: '/orders/track',
  },
}