import { z } from 'zod'
import { emailSchema, mobileSchema } from '@/lib/validation'

// Shape checks only; the backend decides whether the account exists and may use the admin area.
export const adminLoginSchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(1, 'Enter your email address or mobile number')
        .refine(
            (value) => (value.includes('@') ? emailSchema.safeParse(value).success : mobileSchema.safeParse(value).success),
            'Enter a valid email address or 10-digit mobile number',
        ),
    password: z.string().min(1, 'Enter your password'),
})

export const adminLoginDefaults = { identifier: '', password: '' }