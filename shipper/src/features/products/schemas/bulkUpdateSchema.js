import { z } from 'zod'

// "" means "leave unchanged" for both selects.
export const bulkUpdateSchema = z
  .object({
    scope: z.enum(['selected', 'filtered']),
    status: z.enum(['', 'active', 'inactive']),
    gstPercent: z.union([z.literal(''), z.number()]),
  })
  .refine((values) => values.status !== '' || values.gstPercent !== '', {
    path: ['status'],
    message: 'Choose at least one change to apply',
  })
