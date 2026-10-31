export const orderHelpers = {
  totalByStatus: (orders = [], status) => orders.filter((order) => order.status === status).length,
  totalAmount: (orders = []) => orders.reduce((sum, order) => sum + (order.total || 0), 0),
};
