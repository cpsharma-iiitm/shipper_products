import { endpoints, http } from '@/app/services'

/**
 * ASSUMPTION — confirm with backend team: POST /auth/login { identifier, password, scope: 'admin' }
 * → { user: { id, name, email, mobile, role }, accessToken }. `scope: 'admin'` makes the backend refuse
 * non-admin accounts with 403, so a customer's credentials never open the admin area. `identifier` is
 * an email address or a 10-digit mobile number.
 */
export async function adminLogin({ identifier, password }) {
    const { data } = await http.post(endpoints.auth.login, { identifier, password, scope: 'admin' })
    return data
}