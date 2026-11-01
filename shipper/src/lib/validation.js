import { z } from 'zod'

// Reusable Zod primitives for forms. These validate input shape for user experience only (format,
// length, required fields). The backend remains the authority for every rule.

const MOBILE_PATTERN = /^[6-9]\d{9}$/

/** Strips spaces, dashes and a leading +91 / 91 so "+91 98765 43210" becomes "9876543210". */
export function normalizeMobile(value) {
  return String(value ?? '')
    .replace(/[\s-]/g, '')
    .replace(/^(?:\+?91)(?=\d{10}$)/, '')
}

export const requiredText = (message) => z.string().trim().min(1, message)

export const mobileSchema = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number')
  .transform(normalizeMobile)
  .pipe(z.string().regex(MOBILE_PATTERN, 'Enter a valid 10-digit mobile number'))

export const optionalMobileSchema = z
  .string()
  .trim()
  .transform(normalizeMobile)
  .refine(
    (value) => value === '' || MOBILE_PATTERN.test(value),
    'Enter a valid 10-digit mobile number, or leave this optional field blank.',
  )

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .pipe(z.email('Enter a valid email address'))

const PASSWORD_RULE = 'Use 8+ characters, including a number and a special character.'

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_RULE)
  .regex(/\d/, PASSWORD_RULE)
  .regex(/[^A-Za-z0-9]/, PASSWORD_RULE)

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code')

export const hsnSchema = z
  .string()
  .trim()
  .regex(/^(?:\d{6}|\d{8})$/, 'HSN must contain 6 or 8 digits.')

/** India Post consignment ID: 2 letters, 9 digits, "IN" (for example EU483920218IN). */
export const CONSIGNMENT_ID_PATTERN = /^[A-Z]{2}\d{9}IN$/

export const consignmentIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(CONSIGNMENT_ID_PATTERN, 'Enter a valid ID: 2 letters, 9 digits, IN.')
