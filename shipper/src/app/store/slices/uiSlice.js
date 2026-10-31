export const authSlice = {
  setUser: (state, user) => ({ ...state, user }),
  clearUser: () => ({ user: null, token: null }),
};

export const cartSlice = {
  addItem: (items, item) => [...items, item],
  removeItem: (items, id) => items.filter((item) => item.id !== id),
  clear: () => [],
};

export const uiSlice = {
  toggleSidebar: (state) => ({ ...state, sidebarOpen: !state.sidebarOpen }),
  closeSidebar: (state) => ({ ...state, sidebarOpen: false }),
};
