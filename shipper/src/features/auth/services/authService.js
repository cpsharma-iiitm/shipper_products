import { endpoints, http } from '@/app/services'

/** ASSUMPTION — confirm with backend team: POST /auth/logout invalidates the session. */
export async function logout() {
  await http.post(endpoints.auth.logout)
}

/**
 * ASSUMPTION — confirm with backend team. Request: { identifier (mobile or email), password, rememberMe, scope: 'customer' }.
 * Response: { user: { id, name, email, mobile, role }, accessToken }. Wrong credentials answer 401 with a message.
 */
export async function login(credentials) {
  const { data } = await http.post(endpoints.auth.login, credentials)
  return data
}

/**
 * ASSUMPTION — confirm with backend team. Request: { name, mobile, email, password, acceptedTerms, marketingOptIn }.
 * Response (201): the same session as login. A mobile number that already has an account answers 409.
 */
export async function signup(details) {
  const { data } = await http.post(endpoints.auth.signup, details)
  return data
}

/** ASSUMPTION — confirm with backend team. GET /auth/mobile-availability?mobile=9876543210 → { mobile, available }. */
export async function checkMobileAvailability(mobile) {
  const { data } = await http.get(endpoints.auth.mobileAvailability, { params: { mobile } })
  return data
}
