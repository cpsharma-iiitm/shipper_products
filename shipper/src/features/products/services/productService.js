export const productService = {
  list: async () => [
    { id: 'p-101', name: 'Aero Speaker X', price: 2499, category: 'Electronics' },
    { id: 'p-102', name: 'Urban Tote', price: 1599, category: 'Fashion' },
    { id: 'p-103', name: 'Luma Lamp', price: 3199, category: 'Home' },
  ],
  getById: async (id) => ({ id, name: 'Aero Speaker X', price: 2499, category: 'Electronics' }),
};
