import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import uiReducer from './slices/uiSlice'
import { createPersistenceMiddleware, loadPersistedState } from './persistence'
export function createAppStore(preloadedState) {
    const persistence = createPersistenceMiddleware()
    return configureStore({
        reducer: { auth: authReducer, cart: cartReducer, ui: uiReducer },
        preloadedState,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
    })
}
export const store = createAppStore(loadPersistedState())
export * from './slices/authSlice'
export * from './slices/cartSlice'
export * from './slices/uiSlice'