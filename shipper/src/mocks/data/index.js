export const productCatalog = [
  { id: 'p-101', name: 'Aero Speaker X', category: 'Electronics', price: 2499, stock: 42, rating: 4.8 },
  { id: 'p-102', name: 'Urban Tote', category: 'Fashion', price: 1599, stock: 18, rating: 4.6 },
  { id: 'p-103', name: 'Luma Lamp', category: 'Home', price: 3199, stock: 12, rating: 4.9 },
  { id: 'p-104', name: 'Pulse Bottle', category: 'Fitness', price: 899, stock: 36, rating: 4.5 },
  { id: 'p-105', name: 'Studio Keyboard', category: 'Office', price: 4599, stock: 24, rating: 4.7 },
  { id: 'p-106', name: 'Scented Candle Set', category: 'Beauty', price: 1299, stock: 28, rating: 4.4 },
];

export const ordersCatalog = [
  { id: 'SO-1001', customer: 'Ritika', status: 'confirmed', total: 3299 },
  { id: 'SO-1002', customer: 'Karan', status: 'shipped', total: 2899 },
  { id: 'SO-1003', customer: 'Ayesha', status: 'delivered', total: 4125 },
  { id: 'SO-1004', customer: 'Mehul', status: 'pending', total: 1899 },
];

export const customerCatalog = [
  { id: 'C-101', name: 'Ritika Sharma', email: 'ritika@example.com', tier: 'VIP', walletBalance: 1200 },
  { id: 'C-102', name: 'Karan Mehta', email: 'karan@example.com', tier: 'Loyal', walletBalance: 430 },
  { id: 'C-103', name: 'Ayesha Khan', email: 'ayesha@example.com', tier: 'Premium', walletBalance: 2800 },
];

export const dashboardStats = {
  revenue: 184000,
  orders: 482,
  conversion: 5.4,
  returningCustomers: 62,
};
