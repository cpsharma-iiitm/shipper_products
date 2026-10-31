export const cartService = {
  getCart: async () => [],
  addItem: async (item) => ({ ok: true, item }),
  updateItem: async (id, qty) => ({ ok: true, id, qty }),
};
