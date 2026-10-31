import { createSlice } from '@reduxjs/toolkit'
// Persisted UI preferences. Transient UI (open dialogs, filter sheets) stays in component state.
export const initialUiState = {
  adminSidebarCollapsed: false,
  deliveryLocation: null, // { pin: '226010', city: 'Lucknow' }
}
const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    adminSidebarToggled(state) {
      state.adminSidebarCollapsed = !state.adminSidebarCollapsed
    },
    adminSidebarCollapsedSet(state, { payload }) {
      state.adminSidebarCollapsed = Boolean(payload)
    },
    deliveryLocationSet(state, { payload }) {
      state.deliveryLocation = payload ? { pin: payload.pin, city: payload.city } : null
    },
  },
})
export const { adminSidebarToggled, adminSidebarCollapsedSet, deliveryLocationSet } = uiSlice.actions
export default uiSlice.reducer
export const selectAdminSidebarCollapsed = (state) => state.ui.adminSidebarCollapsed
export const selectDeliveryLocation = (state) => state.ui.deliveryLocation