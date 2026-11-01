import { endpoints, http } from '@/app/services'
import { saveBlob } from '@/lib/download'

// The file extension follows what the server returns. The real backend is expected to send PDFs
// (ASSUMPTION — confirm with backend team); the mock API sends a simple HTML document instead.
const extensionFor = (blob) => (blob.type.includes('pdf') ? 'pdf' : 'html')

async function download(url, baseName) {
  const { data } = await http.get(url, { responseType: 'blob' })
  saveBlob(data, `${baseName}.${extensionFor(data)}`)
}

/** Downloads the tax invoice for an order the signed-in user may see. */
export const downloadInvoice = (orderNumber) => download(endpoints.documents.invoice(orderNumber), `Invoice-${orderNumber}`)

/** Downloads the shipping label for an order (admin store operation). */
export const downloadShippingLabel = (orderNumber) => download(endpoints.documents.label(orderNumber), `Label-${orderNumber}`)
