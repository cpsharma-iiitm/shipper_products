// DEV FIXTURES — mock handlers for the admin modules (reports, customers, users, roles, orders, restock).
// Each group lives in ./adminModules/ beside the shared date and paging helpers. Every `/admin/*` call here
// requires the admin session. ASSUMPTION — confirm with backend team: all paths and payloads.
import { customerHandlers } from './adminModules/customerHandlers'
import { orderHandlers } from './adminModules/orderHandlers'
import { reportHandlers } from './adminModules/reportHandlers'
import { restockHandlers } from './adminModules/restockHandlers'
import { userRoleHandlers } from './adminModules/userRoleHandlers'

export const adminModuleHandlers = [...reportHandlers, ...customerHandlers, ...userRoleHandlers, ...orderHandlers, ...restockHandlers]
