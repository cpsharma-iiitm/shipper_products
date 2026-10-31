import { z } from 'zod'
import { emailSchema, mobileSchema, normalizeMobile, passwordSchema, requiredText } from '@/lib/validation'

const MOBILE = /^[6-9]\d{9}$/

// The login field takes either a mobile number or an email address; the backend decides who the person is.
const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number or email')
  .refine((value) => MOBILE.test(normalizeMobile(value)) || z.email().safeParse(value).success, 'Enter a valid mobile number or email address')

export const loginSchema = z.object({
  identifier: identifierSchema,
  // Not checked for strength here: an older account may predate today's password rules.
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
})

export const signupSchema = z.object({
  name: requiredText('Enter your full name').max(80, 'Use 80 characters or fewer'),
  mobile: mobileSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.boolean().refine((accepted) => accepted, 'Accept the Terms of Service and Privacy Policy to create an account'),
  marketingOptIn: z.boolean(),
})
