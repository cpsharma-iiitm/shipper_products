import { createContext, useContext, useMemo, useState } from 'react';

const StoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, token: null, role: 'customer' });
  const [cart, setCart] = useState([]);
  const [ui, setUi] = useState({ sidebarOpen: false, mobileMenuOpen: false });

  const value = useMemo(
    () => ({ auth, setAuth, cart, setCart, ui, setUi }),
    [auth, cart, ui]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }

  return context;
}
