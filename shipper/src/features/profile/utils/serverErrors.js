/**
 * Shows the backend's per-field messages (ApiError.details = { field: message }) under the matching inputs.
 * Returns true when at least one field was marked, so the caller can fall back to a toast otherwise.
 */
export function applyFieldErrors(error, setError, fields) {
  const details = error?.details
  if (!details || typeof details !== 'object') return false

  const known = fields.filter((field) => typeof details[field] === 'string')
  known.forEach((field) => setError(field, { type: 'server', message: details[field] }))
  return known.length > 0
}
