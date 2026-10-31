// Checkout and payment endpoints (owned by the cart/checkout feature).
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
export const checkoutEndpoints = {
  checkout: {
    // POST: validates the cart against the backend quote and creates an order awaiting payment.
    placeOrder: '/checkout/orders',
    // GET: the placed order shown on the confirmation page (owner only).
    order: (orderNumber) => `/checkout/orders/${orderNumber}`,
  },
  payments: {
    // POST: opens a payment session (a Razorpay order on the real backend) for a placed order.
    createSession: '/payments/sessions',
    // POST: sends the gateway result so the backend can verify the signature and mark the order paid.
    confirm: (sessionId) => `/payments/sessions/${sessionId}/confirm`,
    // POST: tells the backend the customer's attempt failed or was dismissed.
    reportFailure: (sessionId) => `/payments/sessions/${sessionId}/failure`,
  },
}