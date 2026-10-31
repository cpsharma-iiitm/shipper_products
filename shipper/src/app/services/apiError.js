import axios from 'axios'
/** Normalised error thrown by every HTTP call, so UI code never inspects raw Axios errors. */
export class ApiError extends Error {
  constructor(message, { status = null, code = null, details = null, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
  get isNetworkError() {
    return this.code === 'NETWORK_ERROR'
  }
  get isUnauthorized() {
    return this.status === 401
  }
}
const STATUS_MESSAGES = {
  400: 'That request could not be processed. Please check the details and try again.',
  401: 'Please log in to continue.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: 'This was changed by someone else. Please refresh and try again.',
  422: 'Please check the highlighted fields and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
}
function defaultMessage(status) {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  return status >= 500 ? 'Something went wrong on our side. Please try again.' : 'Something went wrong. Please try again.'
}
/**
* Converts anything thrown by Axios into an ApiError. Cancellations pass through untouched so that
* TanStack Query can recognise them.
* * ASSUMPTION — confirm with backend team: error bodies look like { message, code, errors }.
* Until agreed, only a string `message` is trusted; otherwise a status-based default is used.
*/
export function toApiError(error) {
  if (error instanceof ApiError || axios.isCancel(error)) return error
  if (axios.isAxiosError(error)) {
    const { response } = error
    if (!response) {
      return new ApiError('Unable to reach the server. Check your connection and try again.', {
        code: 'NETWORK_ERROR',
        cause: error,
      })
    }
    const body = response.data
    return new ApiError(typeof body?.message === 'string' ? body.message : defaultMessage(response.status), {
      status: response.status,
      code: typeof body?.code === 'string' ? body.code : null,
      details: body?.errors ?? body?.details ?? null,
      cause: error,
    })
  }
  return new ApiError(error?.message || 'Something went wrong. Please try again.', { cause: error })
}
/** Message safe to show in a toast or inline error. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error instanceof ApiError && error.message ? error.message : fallback
}