import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. The profile is { id, name, email, mobile } with the mobile as 10 digits.
// Saving returns the stored profile. Failures that belong to a field answer 409 / 422 with
// `errors: { name?, email?, mobile? }` (for example a mobile number already used by another account).
// Changing the mobile number would normally need an OTP check on the backend; the UI only collects the value.

export async function getProfile() {
  const { data } = await http.get(endpoints.account.profile)
  return data
}

export async function updateProfile(payload) {
  const { data } = await http.put(endpoints.account.profile, payload)
  return data
}

// ASSUMPTION — confirm with backend team: POST { currentPassword, newPassword } → 204; a wrong current password
// is a 422 with `errors: { currentPassword }`.
export async function changePassword(payload) {
  await http.post(endpoints.account.password, payload)
}
