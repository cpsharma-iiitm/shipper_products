// DEV FIXTURES — admin users and roles for the mock API. State lives in this module and resets on reload.
// Permissions are display and editing only: nothing here authorises a request. Authorization is backend work.
// ASSUMPTION — confirm with backend team: paths, payloads, the validation rules and the error body
// `{ message, errors: { field: message } }` used for field-level problems.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { buildRoles, buildUsers, PERMISSION_MODULES } from '@/mocks/fixtures/adminUsers'
import { requireAdmin } from '@/mocks/lib/auth'
import { matchesText, sortBy } from '@/mocks/lib/paginate'
import { listResponse, nowIso } from './shared'
 
const state = { users: buildUsers(), roles: buildRoles() }
 
const ACCESS_LEVELS = ['none', 'read', 'write']
const MODULE_KEYS = PERMISSION_MODULES.map((module) => module.key)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 
const fieldError = (status, field, message) => new MockHttpError(status, message, { message, errors: { [field]: message } })
 
const findRole = (id) => state.roles.find((role) => role.id === id)
const findUser = (id) => {
  const user = state.users.find((entry) => entry.id === id)
  if (!user) throw new MockHttpError(404, 'User not found.')
  return user
}
const usersWithRole = (roleId) => state.users.filter((user) => user.roleId === roleId).length
 
const presentUser = (user) => ({ ...user, roleName: findRole(user.roleId)?.name ?? '—' })
const presentRole = (role) => ({ ...role, usersCount: usersWithRole(role.id) })
 
// ── Users ───────────────────────────────────────────────────────────────────────────────────────────
function readUserBody(body, { id } = {}) {
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim().toLowerCase()
  const mobile = String(body?.mobile ?? '').trim()
  if (!name) throw fieldError(422, 'name', 'Enter the full name.')
  if (!EMAIL.test(email)) throw fieldError(422, 'email', 'Enter a valid email address.')
  if (state.users.some((user) => user.email === email && user.id !== id)) throw fieldError(409, 'email', 'Another user already has this email address.')
  if (!findRole(body?.roleId)) throw fieldError(422, 'roleId', 'Choose a role.')
  if (!['active', 'inactive'].includes(body?.status)) throw fieldError(422, 'status', 'Choose a status.')
  return { name, email, mobile, roleId: body.roleId, status: body.status }
}
 
function buildUserList(query) {
  const rows = state.users
    .map(presentUser)
    .filter(
      (user) =>
        matchesText(query.q, user.name, user.email, user.mobile) &&
        (!query.role || user.roleId === query.role) &&
        (!query.status || user.status === query.status),
    )
  const sorted = sortBy(rows, query.sort || 'name', { lastActiveAt: (user) => (user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0) })
  return listResponse(sorted, query, { counts: { all: state.users.length, active: state.users.filter((user) => user.status === 'active').length } })
}
 
// ── Roles ───────────────────────────────────────────────────────────────────────────────────────────
function readPermissions(permissions) {
  return Object.fromEntries(
    MODULE_KEYS.map((key) => {
      const level = permissions?.[key] ?? 'none'
      if (!ACCESS_LEVELS.includes(level)) throw new MockHttpError(422, `Unknown access level for ${key}.`)
      return [key, level]
    }),
  )
}
 
function readRoleName(body, { id } = {}) {
  const name = String(body?.name ?? '').trim()
  if (!name) throw fieldError(422, 'name', 'Enter a role name.')
  if (name.length > 40) throw fieldError(422, 'name', 'Use 40 characters or fewer.')
  if (state.roles.some((role) => role.name.toLowerCase() === name.toLowerCase() && role.id !== id)) {
    throw fieldError(409, 'name', 'A role with this name already exists.')
  }
  return name
}
 
function editableRole(id) {
  const role = findRole(id)
  if (!role) throw new MockHttpError(404, 'Role not found.')
  if (role.system) throw new MockHttpError(409, 'The Administrator role is built in and cannot be changed or deleted.')
  return role
}
 
export const userRoleHandlers = [
  defineHandler('get', '/admin/users', ({ query, headers }) => {
    requireAdmin(headers)
    return { data: buildUserList(query) }
  }),
 
  defineHandler('post', '/admin/users', ({ body, headers }) => {
    requireAdmin(headers)
    const user = { id: `adm_${Date.now().toString(36)}`, ...readUserBody(body), lastActiveAt: null, createdAt: nowIso() }
    state.users.push(user)
    return { status: 201, data: presentUser(user) }
  }),
 
  defineHandler('put', '/admin/users/:id', ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const user = findUser(params.id)
    const next = readUserBody(body, { id: user.id })
    if (user.id === admin.id && next.status === 'inactive') throw new MockHttpError(409, "You can't deactivate your own account.")
    Object.assign(user, next)
    return { data: presentUser(user) }
  }),
 
  defineHandler('patch', '/admin/users/:id/status', ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const user = findUser(params.id)
    if (!['active', 'inactive'].includes(body?.status)) throw new MockHttpError(422, 'Choose a status.')
    if (user.id === admin.id && body.status === 'inactive') throw new MockHttpError(409, "You can't deactivate your own account.")
    user.status = body.status
    return { data: presentUser(user) }
  }),
 
  defineHandler('delete', '/admin/users/:id', ({ params, headers }) => {
    const admin = requireAdmin(headers)
    const user = findUser(params.id)
    if (user.id === admin.id) throw new MockHttpError(409, "You can't delete your own account.")
    state.users = state.users.filter((entry) => entry.id !== user.id)
    return { status: 204, data: null }
  }),
 
  defineHandler('get', '/admin/roles', ({ headers }) => {
    requireAdmin(headers)
    return { data: { items: state.roles.map(presentRole), modules: PERMISSION_MODULES } }
  }),
 
  defineHandler('post', '/admin/roles', ({ body, headers }) => {
    requireAdmin(headers)
    const name = readRoleName(body)
    const source = body?.copyFrom ? findRole(body.copyFrom) : null
    const role = {
      id: `role_${Date.now().toString(36)}`,
      name,
      description: String(body?.description ?? '').trim().slice(0, 120),
      system: false,
      permissions: readPermissions(source?.permissions),
      updatedAt: nowIso(),
    }
    state.roles.push(role)
    return { status: 201, data: presentRole(role) }
  }),
 
  defineHandler('put', '/admin/roles/:id', ({ params, body, headers }) => {
    requireAdmin(headers)
    const role = editableRole(params.id)
    if (body?.name !== undefined) role.name = readRoleName(body, { id: role.id })
    if (body?.description !== undefined) role.description = String(body.description).trim().slice(0, 120)
    if (body?.permissions !== undefined) role.permissions = readPermissions(body.permissions)
    role.updatedAt = nowIso()
    return { data: presentRole(role) }
  }),
 
  defineHandler('delete', '/admin/roles/:id', ({ params, headers }) => {
    requireAdmin(headers)
    const role = editableRole(params.id)
    const assigned = usersWithRole(role.id)
    if (assigned > 0) throw new MockHttpError(409, `Reassign the ${assigned} ${assigned === 1 ? 'user' : 'users'} with this role before deleting it.`)
    state.roles = state.roles.filter((entry) => entry.id !== role.id)
    return { status: 204, data: null }
  }),
]
