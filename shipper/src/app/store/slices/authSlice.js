import { createSlice } from '@reduxjs/toolkit'
// UI-facing session state only. Real authentication, token issuing and authorization are backend
// work. ASSUMPTION — confirm with backend team: bearer token held in memory (below) vs httpOnly
// cookie. If cookies are used, `accessToken` is removed. The token is deliberately not persisted.
const initialState = {
  status: 'anonymous', // 'anonymous' | 'authenticated'
  user: null, // { id, name, email, mobile, role, ... } as returned by the backend
  accessToken: null,
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(state, { payload }) {
      state.status = 'authenticated'
      state.user = payload.user
      state.accessToken = payload.accessToken ?? null
    },
    signedOut() {
      return initialState
    },
    userUpdated(state, { payload }) {
      if (state.user) state.user = { ...state.user, ...payload }
    },
  },
})
export const { signedIn, signedOut, userUpdated } = authSlice.actions
export default authSlice.reducer
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated'
export const selectCurrentUser = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken