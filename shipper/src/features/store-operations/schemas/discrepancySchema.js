import { z } from 'zod'
import { requiredText } from '@/lib/validation'

/** Short-pick report. `lines` is the pick list, so the counted quantity can be checked against what was requested. */
export const createDiscrepancySchema = (lines) =>
  z
    .object({
      productCode: requiredText('Choose the product that is short'),
      // An empty field would coerce to 0, so it is rejected before the number is read.
      availableQuantity: z
        .string()
        .trim()
        .min(1, 'Enter the quantity you found')
        .pipe(z.coerce.number('Enter the quantity you found').int('Enter a whole number').min(0, 'The quantity cannot be negative')),
      note: z.string().trim().max(160, 'Use 160 characters or fewer'),
    })
    .superRefine((value, context) => {
      const line = lines.find((candidate) => candidate.productCode === value.productCode)
      if (line && value.availableQuantity >= line.quantity) {
        context.addIssue({ code: 'custom', path: ['availableQuantity'], message: `Enter fewer than the ${line.quantity} requested.` })
      }
    })
