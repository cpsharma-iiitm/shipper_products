// Admin store operation (warehouse fulfilment) and shipping endpoints, merged into `endpoints.admin`.
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
const STORE = '/admin/store-operations'
export const adminOpsEndpoints = {
  storeOperations: {
    options: `${STORE}/options`,
    counts: `${STORE}/counts`,
    queue: `${STORE}/queue`,
    export: `${STORE}/export`,
    pickList: `${STORE}/pick-list`,
    order: (orderNumber) => `${STORE}/orders/${orderNumber}`,
    verify: (orderNumber) => `${STORE}/orders/${orderNumber}/verify`,
    hold: (orderNumber) => `${STORE}/orders/${orderNumber}/hold`,
    stockException: (orderNumber) => `${STORE}/orders/${orderNumber}/stock-exception`,
    picked: (orderNumber) => `${STORE}/orders/${orderNumber}/picked`,
    packed: (orderNumber) => `${STORE}/orders/${orderNumber}/packed`,
    dispatch: (orderNumber) => `${STORE}/orders/${orderNumber}/dispatch`,
    resolution: (orderNumber) => `${STORE}/orders/${orderNumber}/resolution`,
    resolve: (orderNumber) => `${STORE}/orders/${orderNumber}/resolve`,
    bulkVerify: `${STORE}/verify`,
    bulkDispatch: `${STORE}/dispatch`,
    assignOwner: `${STORE}/assign-owner`,
    notifyCustomers: `${STORE}/notify-customers`,
    refreshTracking: `${STORE}/tracking/refresh`,
  },
  shipping: {
    shipments: '/admin/shipments',
  },
}