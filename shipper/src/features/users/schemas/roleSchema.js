import { z } from 'zod'
import { requiredText } from '@/lib/validation'

export const roleSchema = z.object({
  name: requiredText('Enter a role name').max(40, 'Use 40 characters or fewer'),
  description: z.string().trim().max(120, 'Use 120 characters or fewer'),
  copyFrom: z.string(),
})
