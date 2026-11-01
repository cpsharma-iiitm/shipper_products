import { env } from '@/app/config/env'
import { endpoints, http } from '@/app/services'

/** The customer's payment did not go through (declined, or the payment window was closed). */
export class PaymentError extends Error {
  constructor(message, { code = 'payment_failed' } = {}) {
    super(message)
    this.name = 'PaymentError'
    this.code = code
  }
}

/**
 * ASSUMPTION — confirm with backend team. Opens a payment session for a placed order (Razorpay order).
 * `method` ('upi' | 'card' | 'netbanking') is the customer's choice, recorded on the order.
 * Response (201): { sessionId, orderNumber, gateway: 'razorpay', gatewayOrderId, keyId, amount, currency }
 */
export async function createPaymentSession(orderNumber, method) {
  const { data } = await http.post(endpoints.payments.createSession, { orderNumber, method })
  return data
}

/**
 * ASSUMPTION — confirm with backend team. Sends the gateway result for server-side signature
 * verification. Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }.
 * Response: { orderNumber, paymentStatus: 'paid' }
 */
export async function confirmPayment(sessionId, { razorpayPaymentId, razorpayOrderId, razorpaySignature }) {
  const { data } = await http.post(endpoints.payments.confirm(sessionId), { razorpayPaymentId, razorpayOrderId, razorpaySignature })
  return data
}

/** ASSUMPTION — confirm with backend team. Lets the backend record a failed or dismissed attempt. */
export async function reportPaymentFailure(sessionId, reason) {
  await http.post(endpoints.payments.reportFailure(sessionId), { reason })
}

/**
 * The payment window. Resolves with the gateway's outcome:
 *   { outcome: 'success', razorpayPaymentId, razorpayOrderId, razorpaySignature }
 *   { outcome: 'failed', reason }       the payment was declined
 *   { outcome: 'dismissed' }            the customer closed the window
 */
async function openPaymentWindow(session, options) {
  if (env.useMockApi) {
    // DEV FIXTURE: a fake gateway that approves immediately (and declines UPI IDs starting "fail@").
    // It is loaded only in mock mode and never talks to Razorpay.
    const { openMockCheckout } = await import('@/mocks/lib/paymentGateway')
    return openMockCheckout(session, options)
  }

  // INTEGRATION POINT — Razorpay Checkout.js (https://checkout.razorpay.com/v1/checkout.js). Once the script
  // is loaded, this is where the window opens and its three outcomes are mapped onto the result above:
  //   const checkout = new window.Razorpay({
  //     key: session.keyId,
  //     order_id: session.gatewayOrderId,
  //     amount: session.amount,
  //     currency: session.currency,
  //     prefill: options.prefill,
  //     handler: (response) => resolve({ outcome: 'success', razorpayPaymentId: response.razorpay_payment_id, ... }),
  //     modal: { ondismiss: () => resolve({ outcome: 'dismissed' }) },
  //   })
  //   checkout.on('payment.failed', (event) => resolve({ outcome: 'failed', reason: event.error.description }))
  //   checkout.open()
  throw new PaymentError('Online payments are not connected in this build yet. Please try again later.', { code: 'gateway_unavailable' })
}

/**
 * create session → payment window → confirm. Throws PaymentError when the customer's payment fails or is
 * abandoned (the order stays unpaid so they can try again), and ApiError when the backend refuses a step.
 * `options`: { method: 'upi' | 'card' | 'netbanking', upiId?, prefill?: { name, email, contact } }
 */
export async function payForOrder(orderNumber, options) {
  const session = await createPaymentSession(orderNumber, options.method)
  const result = await openPaymentWindow(session, options)

  if (result.outcome !== 'success') {
    const dismissed = result.outcome === 'dismissed'
    // Best effort: the customer needs the failure message even if recording it fails.
    await reportPaymentFailure(session.sessionId, dismissed ? 'dismissed' : result.reason).catch(() => {})
    throw new PaymentError(
      dismissed ? 'The payment window was closed before the payment finished. You have not been charged.' : result.reason,
      { code: dismissed ? 'payment_dismissed' : 'payment_failed' },
    )
  }
  return confirmPayment(session.sessionId, result)
}
