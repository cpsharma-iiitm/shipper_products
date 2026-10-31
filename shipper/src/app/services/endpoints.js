import { accountEndpoints } from './endpointGroups/account'
import { addressEndpoints } from './endpointGroups/addresses'
import { adminCoreEndpoints } from './endpointGroups/adminCore'
import { adminModuleEndpoints } from './endpointGroups/adminModules'
import { adminOpsEndpoints } from './endpointGroups/adminOps'
import { catalogEndpoints } from './endpointGroups/catalog'
import { checkoutEndpoints } from './endpointGroups/checkout'
import { documentEndpoints } from './endpointGroups/documents'
import { savedEndpoints } from './endpointGroups/saved'
// Every API path the frontend calls, composed from one file per area so each can grow independently.
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes
// are proposals so screens can be built; none has been agreed with the backend. Change them in the
// group files under ./endpointGroups and nowhere else when the real contract arrives.
export const endpoints = {
  ...accountEndpoints,
  ...addressEndpoints,
  ...catalogEndpoints,
  ...checkoutEndpoints,
  ...documentEndpoints,
  ...savedEndpoints,
  admin: { ...adminCoreEndpoints, ...adminOpsEndpoints, ...adminModuleEndpoints },
}