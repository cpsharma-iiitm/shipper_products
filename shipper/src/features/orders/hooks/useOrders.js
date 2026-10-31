export const useOrders = () => ({
  list: async () => [
    { id: 'SO-1001', customer: 'Ritika', status: 'confirmed', total: 3299 },
    { id: 'SO-1002', customer: 'Karan', status: 'shipped', total: 2899 },
  ],
});
