import { endpoints, http } from '@/app/services'
import { saveBlob } from '@/lib/download'

// ASSUMPTION — confirm with backend team. The API groups warehouse work into stages:
//   new | to_pick | to_pack | ready (packed, waiting for India Post) | dispatched (last 14 days) | delayed
// and exposes, per stage, a paged queue plus a "work order" with everything the side panel needs.
//
//   counts → { new, to_pick, to_pack, ready, dispatched, delayed, delayedBeyondSla, slaHours }
//   queue  → { items: QueueRow[], page, pageSize, totalItems, pageCount, summary }   (summary differs per stage)
//   QueueRow  → { orderNumber, customerName, city, pin, placedAt, units, grossAmount, paymentStatus, paymentMethod,
//                 status, onHold, priority, assignee, pickBatch, hasShortage, invoiceNumber, weightKg,
//                 shipment: { carrier, service, consignmentId, dispatchedAt, expectedDelivery, status, trackingUrl } | null,
//                 delay: { issue, group, label, ageHours, owner, priority } | null }
//   WorkOrder → see mocks/lib/fulfilment.js (toWorkOrder): customer, address, payment, lines with bin/batch/available,
//               stock, fulfilment, pack.suggested/recorded, invoice, shipment, tracking[], delay, dispatch
//   Mutations answer with the updated WorkOrder (single) or { succeeded: string[], failed: [{ orderNumber, reason }] } (bulk).
//   Business-rule refusals are 409 (wrong stage, on hold, unpaid) or 422 with { errors: { field: message } }.
const urls = endpoints.admin.storeOperations

/** Drops empty and "all" values so only real filters reach the query string. */
const toParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all'))

export async function getStageCounts() {
  const { data } = await http.get(urls.counts)
  return data
}

export async function getStoreOptions() {
  const { data } = await http.get(urls.options)
  return data
}

export async function getQueue(params) {
  const { data } = await http.get(urls.queue, { params: toParams(params) })
  return data
}

/** Every row matching the filters, for the Excel exports (the real backend may generate the file itself). */
export async function getAllQueueRows(params) {
  const { data } = await http.get(urls.export, { params: toParams(params) })
  return data.items
}

export async function getWorkOrder(orderNumber) {
  const { data } = await http.get(urls.order(orderNumber))
  return data
}

/** Downloads the consolidated pick list of the To Pick queue (the mock API returns an HTML page, the real one a PDF). */
export async function downloadPickList(params) {
  const { data } = await http.get(urls.pickList, { params: toParams(params), responseType: 'blob' })
  saveBlob(data, `Pick-list.${data.type.includes('pdf') ? 'pdf' : 'html'}`)
}

const post = async (url, payload) => (await http.post(url, payload)).data

export const verifyOrder = (orderNumber) => post(urls.verify(orderNumber))
export const verifyOrders = (orderNumbers) => post(urls.bulkVerify, { orderNumbers })
export const holdOrder = (orderNumber) => post(urls.hold(orderNumber))
export const reportStockException = ({ orderNumber, ...payload }) => post(urls.stockException(orderNumber), payload)
export const markPicked = ({ orderNumber, lines }) => post(urls.picked(orderNumber), { lines })
export const markPacked = ({ orderNumber, ...payload }) => post(urls.packed(orderNumber), payload)
export const dispatchOrder = ({ orderNumber, ...payload }) => post(urls.dispatch(orderNumber), payload)
export const dispatchOrders = (entries) => post(urls.bulkDispatch, { entries })
export const resolveDelay = (orderNumber) => post(urls.resolve(orderNumber))
export const assignOwner = ({ orderNumbers, owner }) => post(urls.assignOwner, { orderNumbers, owner })
export const notifyCustomers = (orderNumbers) => post(urls.notifyCustomers, { orderNumbers })
export const refreshTracking = () => post(urls.refreshTracking)

export async function saveResolution({ orderNumber, ...payload }) {
  const { data } = await http.put(urls.resolution(orderNumber), payload)
  return data
}
