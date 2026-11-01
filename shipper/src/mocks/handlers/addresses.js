// DEV FIXTURES — saved addresses of the signed-in customer for the mock API.
// ASSUMPTION — confirm with backend team: paths and payloads (see features/addresses/services).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, ensureCustomer } from '@/mocks/db'
import { SERVICEABLE_PINS } from '@/mocks/fixtures/serviceability'
import { requireUser } from '@/mocks/lib/auth'

function customerAddresses(headers) {
  const user = requireUser(headers)
  if (user.role !== 'customer') throw new MockHttpError(403, 'Addresses belong to customer accounts.')
  const customer = ensureCustomer(user)
  return (db.addresses[customer.id] ??= [])
}

const toRecord = (body, id) => {
  const pin = String(body?.pin ?? '').trim()
  return {
    id,
    label: String(body?.label ?? '').trim(),
    name: String(body?.name ?? '').trim(),
    mobile: String(body?.mobile ?? '').trim(),
    line1: String(body?.line1 ?? '').trim(),
    line2: String(body?.line2 ?? '').trim(),
    landmark: String(body?.landmark ?? '').trim(),
    city: String(body?.city ?? '').trim(),
    state: String(body?.state ?? '').trim(),
    pin,
    isDefault: Boolean(body?.isDefault),
    verified: Boolean(SERVICEABLE_PINS[pin]),
  }
}

const assertComplete = (record) => {
  const missing = ['label', 'name', 'mobile', 'line1', 'line2', 'city', 'state', 'pin'].filter((field) => !record[field])
  if (missing.length > 0) throw new MockHttpError(422, `Missing ${missing.join(', ')}.`)
}

/** Exactly one default address while the customer has any. */
function normalizeDefaults(addresses, preferredId) {
  if (addresses.length === 0) return
  const chosen = addresses.find((address) => address.id === preferredId && address.isDefault) ?? addresses.find((address) => address.isDefault) ?? addresses[0]
  addresses.forEach((address) => {
    address.isDefault = address === chosen
  })
}

export const addressHandlers = [
  defineHandler('get', '/addresses', ({ headers }) => ({ data: { items: customerAddresses(headers) } })),

  defineHandler('post', '/addresses', ({ body, headers }) => {
    const addresses = customerAddresses(headers)
    const record = toRecord(body, `addr_${Date.now().toString(36)}`)
    assertComplete(record)
    if (addresses.length === 0) record.isDefault = true
    addresses.push(record)
    normalizeDefaults(addresses, record.isDefault ? record.id : undefined)
    return { status: 201, data: record }
  }),

  defineHandler('put', '/addresses/:id', ({ params, body, headers }) => {
    const addresses = customerAddresses(headers)
    const index = addresses.findIndex((address) => address.id === params.id)
    if (index === -1) throw new MockHttpError(404, 'Address not found.')
    const record = toRecord(body, params.id)
    assertComplete(record)
    addresses[index] = record
    normalizeDefaults(addresses, record.isDefault ? record.id : undefined)
    return { data: addresses[index] }
  }),

  defineHandler('delete', '/addresses/:id', ({ params, headers }) => {
    const addresses = customerAddresses(headers)
    const index = addresses.findIndex((address) => address.id === params.id)
    if (index === -1) throw new MockHttpError(404, 'Address not found.')
    addresses.splice(index, 1)
    normalizeDefaults(addresses)
    return { status: 204 }
  }),

  defineHandler('post', '/addresses/:id/default', ({ params, headers }) => {
    const addresses = customerAddresses(headers)
    const address = addresses.find((entry) => entry.id === params.id)
    if (!address) throw new MockHttpError(404, 'Address not found.')
    addresses.forEach((entry) => {
      entry.isDefault = entry === address
    })
    return { data: address }
  }),
]
