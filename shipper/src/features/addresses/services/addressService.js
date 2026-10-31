import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. An address is
//   { id, label, name, mobile, line1, line2, landmark, city, state, pin, isDefault, verified }
// `verified` means the backend confirmed the PIN code is serviceable. Creating or editing returns the saved address.

export async function listAddresses() {
    const { data } = await http.get(endpoints.addresses.list)
    return data.items
}

export async function createAddress(payload) {
    const { data } = await http.post(endpoints.addresses.list, payload)
    return data
}

export async function updateAddress({ id, ...payload }) {
    const { data } = await http.put(endpoints.addresses.item(id), payload)
    return data
}

export async function deleteAddress(id) {
    await http.delete(endpoints.addresses.item(id))
}

export async function setDefaultAddress(id) {
    const { data } = await http.post(endpoints.addresses.setDefault(id))
    return data
}