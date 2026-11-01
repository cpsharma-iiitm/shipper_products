/**
 * Shows the backend's per-field validation messages (422 { errors: { field: message } }) on the form.
 * Returns true when at least one field message was applied.
 * ASSUMPTION — confirm with backend team: the shape of field errors.
 */
export function applyServerErrors(error, setError) {
  const fields = error?.status === 422 && error.details && typeof error.details === 'object' ? Object.entries(error.details) : []
  fields.forEach(([field, message]) => setError(field, { type: 'server', message: String(message) }))
  return fields.length > 0
}
