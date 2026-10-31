import { createSelector, createSlice } from '@reduxjs/toolkit'
// Client-side cart intent: which products and how many. Prices, GST, shipping, wallet and totals are
// never stored or derived here; they come from the backend quote for these lines.
// ASSUMPTION — confirm with backend team: a line is identified by product code (e.g. HL001).
const initialState = {
  items: [], // [{ productCode, quantity, savedForLater }]
}
const toQuantity = (value) => Math.max(1, Math.floor(Number(value)) || 1)
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded(state, { payload: { productCode, quantity = 1 } }) {
      const line = state.items.find((item) => item.productCode === productCode)
      if (line) {
        line.quantity += toQuantity(quantity)
        line.savedForLater = false
      } else {
        state.items.push({ productCode, quantity: toQuantity(quantity), savedForLater: false })
      }
    },
    quantityChanged(state, { payload: { productCode, quantity } }) {
      const line = state.items.find((item) => item.productCode === productCode)
      if (line) line.quantity = toQuantity(quantity)
    },
    itemRemoved(state, { payload: productCode }) {
      state.items = state.items.filter((item) => item.productCode !== productCode)
    },
    savedForLaterToggled(state, { payload: productCode }) {
      const line = state.items.find((item) => item.productCode === productCode)
      if (line) line.savedForLater = !line.savedForLater
    },
    cartCleared() {
      return initialState
    },
  },
})
export const { itemAdded, quantityChanged, itemRemoved, savedForLaterToggled, cartCleared } = cartSlice.actions
export default cartSlice.reducer
const selectItems = (state) => state.cart.items
export const selectActiveCartItems = createSelector([selectItems], (items) =>
  items.filter((item) => !item.savedForLater),
)
export const selectSavedForLaterItems = createSelector([selectItems], (items) =>
  items.filter((item) => item.savedForLater),
)
/** Units in the cart: the number shown in the header, "Cart (4)". */
export const selectCartUnitCount = createSelector([selectActiveCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
)