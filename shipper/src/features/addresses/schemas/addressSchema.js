import { z } from 'zod'
import { mobileSchema, pinCodeSchema, requiredText } from '@/lib/validation'
 
// Shape and length checks for a better form experience; the backend validates and verifies the address.
export const addressSchema = z.object({
  label: requiredText('Give this address a label, for example Home or Office').max(24, 'Use 24 characters or fewer'),
  name: requiredText('Enter the full name of the person receiving the order'),
  mobile: mobileSchema,
  line1: requiredText('Enter the house, flat or building'),
  line2: requiredText('Enter the street or area'),
  landmark: z.string().trim().max(80, 'Use 80 characters or fewer'),
  city: requiredText('Enter the city'),
  pin: pinCodeSchema,
  state: requiredText('Select the state'),
  isDefault: z.boolean(),
})