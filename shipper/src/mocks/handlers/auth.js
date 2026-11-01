import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, ensureCustomer } from '@/mocks/db'
import { DEMO_PASSWORD } from '@/mocks/fixtures/users'
 
const normalizeIdentifier = (value = '') => String(value).trim().toLowerCase().replace(/[\s-]/g, '').replace(/^\+?91(?=\d{10}$)/, '')
 
const publicUser = ({ id, name, email, mobile, role }) => ({ id, name, email, mobile, role })
const toSession = (account) => ({ user: publicUser(account), accessToken: `mock-token-${account.id}` })
 
export const authHandlers = [
  defineHandler('post', '/auth/login', ({ body }) => {
    const identifier = normalizeIdentifier(body?.identifier)
    const account = db.accounts.find((candidate) => candidate.email.toLowerCase() === identifier || candidate.mobile === identifier)
    if (!account || (account.password ?? DEMO_PASSWORD) !== body?.password) {
      throw new MockHttpError(401, 'Incorrect mobile number, email or password.')
    }
    if (body?.scope === 'admin' && account.role !== 'admin') {
      throw new MockHttpError(403, 'This account does not have admin access.')
    }
    return { data: toSession(account) }
  }),
 
  defineHandler('post', '/auth/logout', () => ({ status: 204 })),
 
  defineHandler('get', '/auth/mobile-availability', ({ query }) => {
    const mobile = normalizeIdentifier(query.mobile)
    return { data: { mobile, available: !db.accounts.some((account) => account.mobile === mobile) } }
  }),
 
  defineHandler('post', '/auth/signup', ({ body }) => {
    const mobile = normalizeIdentifier(body?.mobile)
    if (db.accounts.some((account) => account.mobile === mobile)) {
      throw new MockHttpError(409, 'An account with a mobile number already exists.')
    }
    const account = { id: `cus_${mobile}`, name: body.name, email: body.email, mobile, role: 'customer', password: body.password }
    db.accounts.push(account)
    ensureCustomer(account)
    return { status: 201, data: toSession(account) }
  }),
]
