import axios from 'axios'
import { env } from '@/app/config/env'
import { ApiError, toApiError } from './apiError'
/**
* The single Axios instance for the app. Feature services import `http` and nothing else from
* Axios. Credentials and 401 handling are injected through configureHttp() at start-up, so this
* module never imports the Redux store.
*/
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})
const handlers = {
  getAuthToken: () => null,
  onUnauthorized: () => { },
}
export function configureHttp(next) {
  Object.assign(handlers, next)
}
http.interceptors.request.use((config) => {
  const token = handlers.getAuthToken()
  // ASSUMPTION — confirm with backend team: bearer token vs httpOnly cookie. If the backend uses
  // cookies, drop this header and set `withCredentials: true` on the instance instead.
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
// A dev server or proxy answers unknown API paths with its index.html (status 200). Treat that as a failed request
// instead of handing a string to code that expects JSON; downloads (blob/arraybuffer) are not checked.
const isHtmlDocument = (response) =>
  typeof response.data === 'string' &&
  [undefined, 'json'].includes(response.config?.responseType) &&
  /^\s*<(!doctype html|html)/i.test(response.data)
http.interceptors.response.use(
  (response) => {
    if (isHtmlDocument(response)) {
      return Promise.reject(
        new ApiError(
          'The server did not return data. Check VITE_API_BASE_URL, or set VITE_USE_MOCK_API=true to use the development fixtures.',
          { status: response.status, code: 'INVALID_RESPONSE' },
        ),
      )
    }
    return response
  },
  (error) => {
    const apiError = toApiError(error)
    if (apiError.status === 401) handlers.onUnauthorized(apiError)
    return Promise.reject(apiError)
  },
)