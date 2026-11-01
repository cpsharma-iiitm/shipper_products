import { z } from 'zod'
import { emailSchema, mobileSchema, optionalMobileSchema, requiredText } from '@/lib/validation'

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Cards' },
  { value: 'netbanking', label: 'Netbanking' },
]

// name@bank: a handle of letters, digits, dots, dashes or underscores, then the bank's PSP name.
const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/

/**
 * Checkout form fields. Shape and format checks for a better experience; the backend validates the order.
 * The delivery address and wallet choice live outside the form because they change the backend quote.
 * Card and netbanking details are never collected here: the payment window handles them.
 */
export const checkoutSchema = z
  .object({
    name: requiredText('Enter your full name'),
    mobile: mobileSchema,
    email: emailSchema,
    deliveryInstructions: z.string().trim().max(200, 'Use 200 characters or fewer'),
    alternateMobile: optionalMobileSchema,
    paymentMethod: z.enum(['upi', 'card', 'netbanking']),
    upiId: z.string().trim(),
    acceptTerms: z.boolean().refine((accepted) => accepted, 'Accept the terms of sale and privacy policy to place your order'),
  })
  .superRefine((values, context) => {
    if (values.paymentMethod !== 'upi') return
    if (values.upiId === '') {
      context.addIssue({ code: 'custom', path: ['upiId'], message: 'Enter your UPI ID' })
    } else if (!UPI_ID_PATTERN.test(values.upiId)) {
      context.addIssue({ code: 'custom', path: ['upiId'], message: 'Enter a valid UPI ID, for example name@bank' })
    }
  })
