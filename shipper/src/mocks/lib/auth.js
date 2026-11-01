import { MockHttpError } from '@/mocks/adapter'
import { db } from '@/mocks/db'

// DEV FIXTURES: the mock sign-in hands out `mock-token-<userId>`; these helpers turn it back into a user.
function readAuthorization(headers) {
  const value = headers?.Authorization ?? headers?.authorization ?? headers?.get?.('Authorization')
  return typeof value === 'string' ? value : ''
}

/** The signed-in account, or null for an anonymous request. */
export function getRequestUser(headers) {
  const match = /^Bearer mock-token-(.+)$/.exec(readAuthorization(headers))
  return match ? (db.accounts.find((account) => account.id === match[1]) ?? null) : null
}

export function requireUser(headers) {
  const user = getRequestUser(headers)
  if (!user) throw new MockHttpError(401, 'Please log in to continue.')
  return user
}

export function requireAdmin(headers) {
  const user = requireUser(headers)
  if (user.role !== 'admin') throw new MockHttpError(403, "You don't have permission to do that.")
  return user
}
