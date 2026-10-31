import { createListenerMiddleware } from '@reduxjs/toolkit'
import { env } from '@/app/config/env'
import { readJson, readSessionJson, removeSessionItem, writeJson, writeSessionJson } from '@/lib/storage'
import { initialUiState } from './slices/uiSlice'
// Only the cart and UI preferences are persisted. Session state is not: authentication belongs to
// the backend and the access token is never written to storage.
//
// DEV FIXTURES ONLY: when the mock API is on, the *demo* sign-in (user summary) is kept in
// sessionStorage so a page reload does not log the reviewer out, and a first visit starts with the
// cart shown in the design. The mock access token is derived from the user id (`mock-token-<id>`), so
// no secret is ever stored. None of this is used with a real backend.
const STORAGE_KEYS = {
  cart: 'shipper.cart.v1',
  ui: 'shipper.ui.v1',
}
const MOCK_SESSION_KEY = 'shipper.mock-session.v1'
// DEV FIXTURE: matches the delivery location shown in the design.
const MOCK_DELIVERY_LOCATION = { pin: '226010', city: 'Lucknow' }
// DEV FIXTURE: the cart in the design (Cart and Checkout artboards).
const MOCK_CART_ITEMS = [
  { productCode: 'HL001', quantity: 2, savedForLater: false },
  { productCode: 'SH002', quantity: 1, savedForLater: false },
  { productCode: 'PC003', quantity: 1, savedForLater: false },
]
// Stored data is untrusted (older versions, manual edits), so each slice is rebuilt field by field.
const sanitizers = {
  cart(raw) {
    if (!raw || !Array.isArray(raw.items)) return undefined
    const items = raw.items
      .filter((item) => item && typeof item.productCode === 'string' && item.productCode !== '')
      .map((item) => ({
        productCode: item.productCode,
        quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1),
        savedForLater: item.savedForLater === true,
      }))
    return { items }
  },
  ui(raw) {
    if (!raw || typeof raw !== 'object') return undefined
    const location = raw.deliveryLocation
    const validLocation =
      location && /^\d{6}$/.test(String(location.pin)) && typeof location.city === 'string'
        ? { pin: String(location.pin), city: location.city }
        : null
    return {
      ...initialUiState,
      adminSidebarCollapsed: raw.adminSidebarCollapsed === true,
      deliveryLocation: validLocation,
    }
  },
}
function loadMockSession() {
  const user = readSessionJson(MOCK_SESSION_KEY)?.user
  if (!user || typeof user.id !== 'string' || typeof user.name !== 'string') return undefined
  const text = (value) => (typeof value === 'string' ? value : '')
  return {
    status: 'authenticated',
    accessToken: `mock-token-${user.id}`,
    user: { id: user.id, name: user.name, email: text(user.email), mobile: text(user.mobile), role: user.role === 'admin' ? 'admin' : 'customer' },
  }
}
export function loadPersistedState() {
  const state = {}
  Object.entries(STORAGE_KEYS).forEach(([slice, key]) => {
    const value = sanitizers[slice](readJson(key))
    if (value) state[slice] = value
  })
  if (env.useMockApi) {
    const session = loadMockSession()
    if (session) state.auth = session
    if (!state.ui) state.ui = { ...initialUiState, deliveryLocation: MOCK_DELIVERY_LOCATION }
    if (!state.cart) state.cart = { items: MOCK_CART_ITEMS }
  }
  return state
}
export function createPersistenceMiddleware() {
  const listener = createListenerMiddleware()
  listener.startListening({
    predicate: (_action, current, previous) => current.cart !== previous.cart || current.ui !== previous.ui,
    effect: (_action, api) => {
      const { cart, ui } = api.getState()
      writeJson(STORAGE_KEYS.cart, cart)
      writeJson(STORAGE_KEYS.ui, ui)
    },
  })
  if (env.useMockApi) {
    listener.startListening({
      predicate: (_action, current, previous) => current.auth !== previous.auth,
      effect: (_action, api) => {
        const { auth } = api.getState()
        if (auth.status === 'authenticated') writeSessionJson(MOCK_SESSION_KEY, { user: auth.user })
        else removeSessionItem(MOCK_SESSION_KEY)
      },
    })
  }
  return listener
}