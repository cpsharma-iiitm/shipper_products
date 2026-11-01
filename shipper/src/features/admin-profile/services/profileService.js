
import { endpoints, http } from '@/app/services'
 
// ASSUMPTION — confirm with backend team: the signed-in admin's own profile.

// GET   /admin/profile → { id, name, email, mobile, role, roleLabel, lastLoginAt, lastLoginPlace, memberSince }

// PATCH /admin/profile { name, email, mobile } → the updated profile. 422 { message, errors: { field: message } }

//       for invalid or already-used details. `role` is not editable here.

// PUT   /admin/profile/password { currentPassword, newPassword } → 204. 422 when the current password is wrong

//       or the new one breaks the password rules. Other sessions are ended by the backend.
 
export async function getProfile() {

  const { data } = await http.get(endpoints.admin.profile.me)

  return data

}
 
export async function updateProfile(values) {

  const { data } = await http.patch(endpoints.admin.profile.me, values)

  return data

}
 
export async function changePassword(values) {

  await http.put(endpoints.admin.profile.password, values)

}