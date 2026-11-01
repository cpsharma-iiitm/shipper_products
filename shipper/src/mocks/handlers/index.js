import { accountHandlers } from './account'
import { addressHandlers } from './addresses'
import { adminCoreHandlers } from './adminCore'
import { adminModuleHandlers } from './adminModules'
import { adminNotificationHandlers } from './adminNotifications'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { catalogHandlers } from './catalog'
import { checkoutHandlers } from './checkout'
import { documentHandlers } from './documents'
import { orderHandlers } from './orders'
import { savedHandlers } from './saved'
import { serviceabilityHandlers } from './serviceability'
import { storeOperationHandlers } from './storeOperations'

// Each feature's handlers live beside the shared fixtures and are replaced by the real API later.
export const handlers = [
  ...authHandlers,
  ...serviceabilityHandlers,
  ...cartHandlers,
  ...checkoutHandlers,
  ...catalogHandlers,
  ...accountHandlers,
  ...addressHandlers,
  ...orderHandlers,
  ...documentHandlers,
  ...savedHandlers,
  ...adminNotificationHandlers,
  ...adminCoreHandlers,
  ...storeOperationHandlers,
  ...adminModuleHandlers,
]
