import { z } from 'zod'
import { consignmentIdSchema, mobileSchema } from '@/lib/validation'

// ASSUMPTION — confirm with backend team: order numbers look like SH10482 (SH plus 4–6 digits).
const orderNumberSchema = z
  .string()
  .trim()
  .min(1, 'Enter your order number')
  .transform((value) => value.toUpperCase().replace(/^#/, ''))
  .pipe(z.string().regex(/^SH\d{4,6}$/, 'Order numbers look like SH10482'))

const consignmentSchema = z
  .string()
  .trim()
  .min(1, 'Enter the consignment ID')
  .pipe(consignmentIdSchema)

// A shipment is found either by order number + the mobile number on the order, or by its consignment ID.
export const trackingSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('order'), orderNumber: orderNumberSchema, mobile: mobileSchema }),
  z.object({ mode: z.literal('consignment'), consignmentId: consignmentSchema }),
])

export const TRACKING_MODES = [
  { key: 'order', label: 'Order number' },
  { key: 'consignment', label: 'Consignment ID' },
]
