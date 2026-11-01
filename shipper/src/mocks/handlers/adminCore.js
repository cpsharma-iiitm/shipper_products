import { adminDashboardHandlers } from './adminCoreDashboard'
import { adminProductHandlers } from './adminCoreProducts'
import { adminProfileHandlers } from './adminCoreProfile'
import { adminPurchaseHandlers } from './adminCorePurchases'

// Admin core (dashboard, products, purchases, profile). Split by screen; every handler requires an admin.
export const adminCoreHandlers = [
  ...adminDashboardHandlers,
  ...adminProductHandlers,
  ...adminPurchaseHandlers,
  ...adminProfileHandlers,
]
