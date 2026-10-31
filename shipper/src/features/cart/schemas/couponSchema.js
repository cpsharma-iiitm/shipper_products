import { z } from 'zod'

// Shape check only; the backend quote decides whether a code exists and applies to this cart.
export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Enter a coupon code')
    .max(24, 'Use 24 characters or fewer')
    .regex(/^[A-Za-z0-9-]+$/, 'Coupon codes use letters and numbers only'),
})
