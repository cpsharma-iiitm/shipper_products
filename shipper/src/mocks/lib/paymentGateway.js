// DEV FIXTURE — a fake stand-in for the Razorpay Checkout window. NOT an integration and NOT
// production-ready: no money moves, no signature is produced, and the "bank" is a few lines below.
//
// It answers the way Checkout.js reports back to the page (success handler, `payment.failed` event,
// or the window being dismissed), so the checkout flow around it is the same one a real gateway needs.
// ASSUMPTION — confirm with backend team: the result shape handed to POST /payments/sessions/:id/confirm.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Any UPI ID starting with "fail@" is declined, to exercise the failure state. */
const DECLINED_UPI = /^fail@/i

/**
 * @param {{ gatewayOrderId: string, orderNumber: string }} session  from POST /payments/sessions
 * @param {{ method: 'upi' | 'card' | 'netbanking', upiId?: string }} options
 * @returns {Promise<{ outcome: 'success', razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string }
 *   | { outcome: 'failed', reason: string }>}
 */
export async function openMockCheckout(session, { method, upiId }) {
  await wait(350)
  if (method === 'upi' && DECLINED_UPI.test(String(upiId ?? '').trim())) {
    return { outcome: 'failed', reason: 'Your bank declined this payment. Try another UPI ID or payment method.' }
  }
  return {
    outcome: 'success',
    razorpayPaymentId: `pay_RZP${session.orderNumber.slice(2)}`,
    razorpayOrderId: session.gatewayOrderId,
    razorpaySignature: 'dev_fixture_signature',
  }
}
