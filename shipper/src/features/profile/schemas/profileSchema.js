import { z } from 'zod'
import { emailSchema, mobileSchema, passwordSchema, requiredText } from '@/lib/validation'

// Shape and length checks for a better form experience; the backend validates and owns uniqueness.
export const profileSchema = z.object({
  name: requiredText('Enter your full name').max(60, 'Use 60 characters or fewer'),
  mobile: mobileSchema,
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password that is different from your current one',
  })
