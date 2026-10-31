export const mockDb = {
  products: [
    { id: 'p-101', name: 'Aero Speaker X', price: 2499, category: 'Electronics' },
    { id: 'p-102', name: 'Urban Tote', price: 1599, category: 'Fashion' },
    { id: 'p-103', name: 'Luma Lamp', price: 3199, category: 'Home' },
  ],
  orders: [
    { id: 'SO-1001', total: 3299, status: 'confirmed' },
    { id: 'SO-1002', total: 2899, status: 'shipped' },
  ],
};

export default mockDb;
