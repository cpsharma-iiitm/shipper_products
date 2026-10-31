// Printable documents (invoice, shipping label). Shared by the customer order screens and the admin
// store operation screens.
// ASSUMPTION — confirm with backend team: paths, and that the real backend returns a PDF.
export const documentEndpoints = {
  documents: {
    invoice: (orderNumber) => `/orders/${orderNumber}/invoice`,
    label: (orderNumber) => `/orders/${orderNumber}/shipping-label`,
  },
}