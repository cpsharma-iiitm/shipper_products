import React, { createContext, useContext, useMemo, useState } from 'react';

const AppProvidersContext = createContext(null);

export function AppProviders({ children }) {
  const [mockMode, setMockMode] = useState(true);
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({ mockMode, setMockMode, user, setUser }),
    [mockMode, user]
  );

  return <AppProvidersContext.Provider value={value}>{children}</AppProvidersContext.Provider>;
}

export function useAppProviders() {
  const context = useContext(AppProvidersContext);

  if (!context) {
    throw new Error('useAppProviders must be used inside AppProviders');
  }

  return context;
}
