export const mockApi = {
  catalog: async () => ({ ok: true, data: [
    { id: 'p-101', name: 'Aero Speaker X', category: 'Electronics', price: 2499 },
    { id: 'p-102', name: 'Urban Tote', category: 'Fashion', price: 1599 },
  ] }),
  auth: async () => ({ ok: true, user: { name: 'Demo User', role: 'customer' } }),
  orders: async () => ({ ok: true, data: [
    { id: 'SO-1001', customer: 'Ritika', status: 'confirmed', total: 3299 },
  ] }),
  dashboard: async () => ({ ok: true, data: { revenue: 184000, orders: 482, conversion: 5.4 } }),
};

export default mockApi;
