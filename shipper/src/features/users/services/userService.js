import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. An admin user is
//   { id, name, email, mobile, roleId, roleName, status: 'active' | 'inactive', lastActiveAt, createdAt }
// Field-level problems come back as 409/422 with { message, errors: { field: message } }.

/** GET users (q, role: role id, status, sort: 'field' | '-field', page, pageSize) → { items, page, pageSize, totalItems, pageCount, counts: { all, active } } */
export async function listUsers(params) {
  const { data } = await http.get(endpoints.admin.users.list, { params })
  return data
}

/** POST { name, email, mobile, roleId, status } → the created user */
export async function createUser(values) {
  const { data } = await http.post(endpoints.admin.users.list, values)
  return data
}

/** PUT { name, email, mobile, roleId, status } → the updated user */
export async function updateUser({ id, ...values }) {
  const { data } = await http.put(endpoints.admin.users.item(id), values)
  return data
}

/** PATCH { status: 'active' | 'inactive' } → the updated user (a user cannot deactivate themselves) */
export async function setUserStatus({ id, status }) {
  const { data } = await http.patch(endpoints.admin.users.status(id), { status })
  return data
}

/** DELETE → 204 (a user cannot delete themselves) */
export async function deleteUser(id) {
  await http.delete(endpoints.admin.users.item(id))
}
