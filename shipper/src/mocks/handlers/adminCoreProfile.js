// DEV FIXTURES — the signed-in admin's own profile. Edits write to `db.accounts`, so the next mock
// sign-in returns the updated details. Passwords are plain text here because this is a fake backend.
// ASSUMPTION — confirm with backend team: paths, payloads, password rules and the "last login" fields.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db } from '@/mocks/db'
import { ago } from '@/mocks/fixtures/clock'
import { DEMO_PASSWORD } from '@/mocks/fixtures/users'
import { requireAdmin } from '@/mocks/lib/auth'

const ROLE_LABELS = { admin: 'Administrator' }
const MOBILE_PATTERN = /^[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

// Sign-in history and join date are backend records; fixed here.
const ACTIVITY = {
  adm_pawan: { lastLoginAt: ago({ hours: 2, minutes: 12 }), lastLoginPlace: 'Lucknow · Chrome on Windows', memberSince: '2025-04-07T10:00:00+05:30' },
}

const normalizeMobile = (value) => String(value ?? '').replace(/[\s-]/g, '').replace(/^\+?91(?=\d{10}$)/, '')

const toProfile = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  mobile: account.mobile,
  role: account.role,
  roleLabel: ROLE_LABELS[account.role] ?? account.role,
  ...ACTIVITY[account.id],
})

const failValidation = (message, errors) => {
  throw new MockHttpError(422, message, { message, errors })
}

export const adminProfileHandlers = [
  defineHandler('get', '/admin/profile', ({ headers }) => ({ data: toProfile(requireAdmin(headers)) })),

  defineHandler('patch', '/admin/profile', ({ body, headers }) => {
    const account = requireAdmin(headers)
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const mobile = normalizeMobile(body?.mobile)

    const errors = {}
    if (!name) errors.name = 'Enter your name.'
    if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
    if (!MOBILE_PATTERN.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.'
    if (Object.keys(errors).length > 0) failValidation('Please check the highlighted fields and try again.', errors)

    const clash = db.accounts.find((other) => other.id !== account.id && (other.email.toLowerCase() === email.toLowerCase() || other.mobile === mobile))
    if (clash) {
      const field = clash.email.toLowerCase() === email.toLowerCase() ? 'email' : 'mobile'
      failValidation('Another account already uses these details.', { [field]: `This ${field === 'email' ? 'email address' : 'mobile number'} belongs to another account.` })
    }

    Object.assign(account, { name, email, mobile })
    return { data: toProfile(account) }
  }),

  defineHandler('put', '/admin/profile/password', ({ body, headers }) => {
    const account = requireAdmin(headers)
    if ((account.password ?? DEMO_PASSWORD) !== body?.currentPassword) {
      failValidation('Your current password is incorrect.', { currentPassword: 'Your current password is incorrect.' })
    }
    if (!PASSWORD_PATTERN.test(String(body?.newPassword ?? ''))) {
      failValidation('Use 8+ characters, including a number and a special character.', {
        newPassword: 'Use 8+ characters, including a number and a special character.',
      })
    }
    account.password = body.newPassword
    return { status: 204 }
  }),
]
