// DEV FIXTURES — invoice and label "documents" for the mock API. They are plain HTML pages so the
// download buttons have something real to hand over; they are NOT tax invoices or carrier labels.
// The real backend generates the PDFs (ASSUMPTION — confirm with backend team).
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { getOrder } from '@/mocks/db'
import { requireUser } from '@/mocks/lib/auth'

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const money = (value) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const asBlob = (html) => ({ data: new Blob([html], { type: 'text/html' }) })

const PAGE_STYLE = `body{font:14px/1.5 Inter,system-ui,sans-serif;color:#172b44;margin:32px auto;max-width:760px}
h1{font-size:22px;margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px;border-bottom:1px solid #e3e9f1;text-align:left}
td.n,th.n{text-align:right}.muted{color:#64748b}.note{margin-top:24px;padding:8px 12px;background:#fff5df;color:#9b620b;border-radius:6px;font-size:12px}`

function loadOrder(headers, orderNumber) {
  const user = requireUser(headers)
  const order = getOrder(orderNumber)
  if (!order || (user.role !== 'admin' && order.customerId !== user.id)) throw new MockHttpError(404, 'Order not found.')
  return order
}

export const documentHandlers = [
  defineHandler('get', '/orders/:orderNumber/invoice', ({ params, headers }) => {
    const order = loadOrder(headers, params.orderNumber)
    const rows = order.lines
      .map(
        (line) =>
          `<tr><td>${escapeHtml(line.name)} <span class="muted">${escapeHtml(line.unit)} · ${escapeHtml(line.productCode)}</span></td><td>${escapeHtml(line.hsn)}</td><td class="n">${line.quantity}</td><td class="n">${money(line.taxable)}</td><td class="n">${line.gstPercent}%</td><td class="n">${money(line.lineTotal)}</td></tr>`,
      )
      .join('')
    const s = order.summary
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.invoiceNumber ?? order.orderNumber)}</title><style>${PAGE_STYLE}</style></head><body>
<h1>Shipper.com · Invoice</h1><p class="muted">${escapeHtml(order.invoiceNumber ?? '—')} · Order ${escapeHtml(order.orderNumber)}</p>
<p><strong>${escapeHtml(order.address.name)}</strong><br>${escapeHtml(order.address.line1)}, ${escapeHtml(order.address.line2)}<br>${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} – ${escapeHtml(order.address.pin)}</p>
<table><thead><tr><th>Item</th><th>HSN</th><th class="n">Qty</th><th class="n">Taxable</th><th class="n">GST</th><th class="n">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<p class="n" style="text-align:right">Taxable subtotal ${money(s.taxableSubtotal)} · GST ${money(s.gstTotal)} · Shipping ${money(s.shipping)} · Wallet −${money(s.walletApplied)}<br><strong>Paid ${money(s.payable)}</strong></p>
<p class="note">DEV FIXTURE — a simulated document from the mock API, not a tax invoice.</p></body></html>`
    return asBlob(html)
  }),

  defineHandler('get', '/orders/:orderNumber/shipping-label', ({ params, headers }) => {
    const order = loadOrder(headers, params.orderNumber)
    const consignment = order.shipment?.consignmentId ?? 'To be assigned'
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Label ${escapeHtml(order.orderNumber)}</title><style>${PAGE_STYLE}</style></head><body>
<h1>India Post · ${escapeHtml(order.shipment?.service ?? 'Speed Post')}</h1><p class="muted">Consignment ${escapeHtml(consignment)} · Order ${escapeHtml(order.orderNumber)}</p>
<p><strong>Deliver to</strong><br>${escapeHtml(order.address.name)} · ${escapeHtml(order.address.mobile)}<br>${escapeHtml(order.address.line1)}, ${escapeHtml(order.address.line2)}<br>${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} – <strong>${escapeHtml(order.address.pin)}</strong></p>
<p class="muted">From Shipper.com · ${escapeHtml(order.fulfilment.warehouse)} · Weight ${order.shipment?.weightKg ?? '—'} kg</p>
<p class="note">DEV FIXTURE — a simulated label from the mock API, not a carrier label.</p></body></html>`
    return asBlob(html)
  }),
]
