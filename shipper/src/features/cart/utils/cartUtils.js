export const cartActions = {
  addItem: (cart = [], item) => [...cart, { ...item, quantity: 1 }],
  removeItem: (cart = [], id) => cart.filter((item) => item.id !== id),
  updateQuantity: (cart = [], id, quantity) => cart.map((item) => item.id === id ? { ...item, quantity } : item),
  clear: () => [],
};

export const cartHelpers = {
  subtotal: (items = []) => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
  totalUnits: (items = []) => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
};
