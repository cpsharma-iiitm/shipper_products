import { z } from 'zod'
import { CONSIGNMENT_ID_PATTERN, consignmentIdSchema, requiredText } from '@/lib/validation'

const mustBeChecked = (message) => z.boolean().refine(Boolean, message)

// Shape checks for a better form experience; the backend validates the consignment ID again and rejects duplicates.
export const dispatchSchema = z.object({
  carrier: requiredText('Choose a carrier'),
  service: requiredText('Choose a service'),
  consignmentId: consignmentIdSchema,
  dispatchDate: requiredText('Choose the dispatch date'),
  documentsAttached: mustBeChecked('Confirm the invoice is printed and the label attached'),
  weightVerified: mustBeChecked('Confirm the weight against the manifest'),
})

/** Several orders at once (Create dispatch manifest): an ID per order dispatched, none repeated. Blank rows are skipped. */
export const manifestSchema = z.object({
  service: requiredText('Choose a service'),
  dispatchDate: requiredText('Choose the dispatch date'),
  entries: z
    .array(
      z.object({
        orderNumber: z.string(),
        consignmentId: z
          .string()
          .trim()
          .toUpperCase()
          .refine((value) => value === '' || CONSIGNMENT_ID_PATTERN.test(value), 'Enter a valid ID: 2 letters, 9 digits, IN.'),
      }),
    )
    .superRefine((entries, context) => {
      const firstSeen = new Map()
      entries.forEach(({ consignmentId }, index) => {
        if (!consignmentId) return
        if (firstSeen.has(consignmentId)) {
          context.addIssue({ code: 'custom', path: [index, 'consignmentId'], message: 'This ID is used twice in the manifest.' })
        }
        firstSeen.set(consignmentId, index)
      })
      if (firstSeen.size === 0) context.addIssue({ code: 'custom', path: [], message: 'Enter a consignment ID for at least one order.' })
    }),
})
