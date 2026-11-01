import { z } from 'zod'
import { requiredText } from '@/lib/validation'

// Shape checks for a better form experience; the backend owns the exception workflow.
export const resolutionSchema = z.object({
  owner: requiredText('Choose a resolution owner'),
  action: requiredText('Choose an action'),
  expectedResolutionAt: requiredText('Choose when this should be resolved'),
  note: z.string().trim().max(240, 'Use 240 characters or fewer'),
  notifyCustomer: z.boolean(),
})
