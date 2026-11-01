import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. Roles and permissions are display and editing UI only; the backend
// authorizes every request against the signed-in user's role. A role is
//   { id, name, description, system, permissions: { [moduleKey]: 'none' | 'read' | 'write' }, usersCount, updatedAt }
// and a module is { key, group, label, description }. The built-in Administrator role (`system: true`) is read-only.

/** GET roles → { items: [role], modules: [module] } (modules are listed in display order, grouped by `group`) */
export async function listRoles() {
  const { data } = await http.get(endpoints.admin.roles.list)
  return data
}

/** POST { name, description, copyFrom?: role id } → the created role (permissions copied from `copyFrom`, else none) */
export async function createRole(values) {
  const { data } = await http.post(endpoints.admin.roles.list, values)
  return data
}

/** PUT { name?, description?, permissions? } → the updated role */
export async function updateRole({ id, ...values }) {
  const { data } = await http.put(endpoints.admin.roles.item(id), values)
  return data
}

/** DELETE → 204 (refused while users are assigned to the role) */
export async function deleteRole(id) {
  await http.delete(endpoints.admin.roles.item(id))
}
