
import { z } from 'zod'

import { emailSchema, mobileSchema, passwordSchema, requiredText } from '@/lib/validation'

// Shape checks only; the backend re-validates and rejects details already used by another account.

export const profileSchema = z.object({

    name: requiredText('Enter your name').pipe(z.string().max(80, 'Use 80 characters or fewer')),

    email: emailSchema,

    mobile: mobileSchema,

})

export const toProfileFormValues = ({ name, email, mobile }) => ({ name, email, mobile })

export const passwordChangeSchema = z

    .object({

        currentPassword: z.string().min(1, 'Enter your current password'),

        newPassword: passwordSchema,

        confirmPassword: z.string().min(1, 'Confirm your new password'),

    })

    .refine((values) => values.confirmPassword === values.newPassword, {

        path: ['confirmPassword'],

        message: 'The passwords do not match',

    })

    .refine((values) => !values.newPassword || values.newPassword !== values.currentPassword, {

        path: ['newPassword'],

        message: 'Choose a password you have not used here before',

    })

export const emptyPasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }