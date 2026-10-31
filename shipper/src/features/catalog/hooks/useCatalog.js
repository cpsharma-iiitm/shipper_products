export const useCatalog = () => ({
  list: async () => [
    { id: 'p-101', name: 'Aero Speaker X', price: 2499, category: 'Electronics', rating: 4.8 },
    { id: 'p-102', name: 'Urban Tote', price: 1599, category: 'Fashion', rating: 4.6 },
    { id: 'p-103', name: 'Luma Lamp', price: 3199, category: 'Home', rating: 4.9 },
    { id: 'p-104', name: 'Pulse Bottle', price: 899, category: 'Fitness', rating: 4.5 },
  ],
  getById: async (id) => ({
    id,
    name: 'Featured Product',
    price: 2299,
    category: 'Electronics',
    rating: 4.8,
    description: 'Premium everyday product with smart performance and modern design.',
  }),
});
