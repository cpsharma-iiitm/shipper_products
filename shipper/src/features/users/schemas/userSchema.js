import { z } from 'zod'
import { optionalMobileSchema, requiredText } from '@/lib/validation'

// Format and required-field checks for the form only: the backend validates again (duplicate emails, roles, status).
export const userSchema = z.object({
  name: requiredText('Enter the full name').max(60, 'Use 60 characters or fewer'),
  email: z.string().trim().min(1, 'Enter the email address').pipe(z.email('Enter a valid email address')),
  mobile: optionalMobileSchema,
  roleId: z.string().min(1, 'Choose a role'),
  status: z.enum(['active', 'inactive']),
})
