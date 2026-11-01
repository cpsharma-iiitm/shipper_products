import { z } from 'zod'
import { requiredText } from '@/lib/validation'

const mustBeChecked = (message) => z.boolean().refine(Boolean, message)
const dimension = (label) => z.coerce.number(`Enter the ${label} in cm`).positive(`The ${label} must be above 0`).max(200, `The ${label} must be 200 cm or less`)

// Shape checks for a better form experience; the backend validates the parcel details again.
export const packSchema = z.object({
  weightKg: z.coerce.number('Enter the parcel weight in kg').positive('The weight must be above 0').max(100, 'The weight must be 100 kg or less'),
  length: dimension('length'),
  width: dimension('width'),
  height: dimension('height'),
  packaging: requiredText('Choose the packaging type'),
  packedBy: requiredText('Choose who packed the order'),
  protectiveWrap: mustBeChecked('Confirm the protective wrap is added'),
  invoiceEnclosed: mustBeChecked('Confirm the invoice is enclosed'),
  boxSealed: mustBeChecked('Confirm the box is sealed'),
})
