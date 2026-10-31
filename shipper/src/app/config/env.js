// Single access point for build-time environment variables. Import { env } from here instead of
// reading import.meta.env directly so every setting is documented in one place.
const toBoolean = (value) => String(value).toLowerCase() === 'true'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const mockSetting = import.meta.env.VITE_USE_MOCK_API ?? ''
// DEV FIXTURES: an explicit VITE_USE_MOCK_API always wins. When it is unset, `npm run dev` with no backend URL
// configured has nothing real to call, so the fixtures are used (the "Mock data" badge shows). Production builds
// never default to them.
const useMockApi = mockSetting === '' ? import.meta.env.DEV && apiBaseUrl === '' : toBoolean(mockSetting)
export const env = Object.freeze({
  // ASSUMPTION — confirm with backend team: base URL of the API.
  apiBaseUrl,
  // DEV FIXTURES: when true, API calls are answered from src/mocks (a simulation, not an integration).
  useMockApi,
  isDevelopment: import.meta.env.DEV,
})