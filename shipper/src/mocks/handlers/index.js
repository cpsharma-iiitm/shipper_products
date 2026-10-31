const handlers = {
  catalog: async () => ({ ok: true, data: [{ id: 'p-101', name: 'Aero Speaker X', price: 2499 }] }),
  dashboard: async () => ({ ok: true, data: { revenue: 184000, orders: 482 } }),
};

export default handlers;
