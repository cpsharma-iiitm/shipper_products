import { z } from 'zod'
import { hsnSchema, requiredText } from '@/lib/validation'

// Shape checks for a better form experience. The backend validates everything again and owns the
// derived values (discount %, stock status); nothing here computes a price.

const amount = (label) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter an amount such as 150.00')
    .transform(Number)
    .refine((value) => value > 0, `The ${label} must be more than 0`)

const wholeNumber = (label) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .regex(/^\d+$/, 'Use a whole number, 0 or more')
    .transform(Number)

export const productSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]{3,16}$/, 'Use 3–16 letters, numbers or hyphens'),
    category: z.string().min(1, 'Select a category'),
    name: requiredText('Enter the product name'),
    batch: requiredText('Enter the batch number'),
    hsn: hsnSchema,
    mrp: amount('MRP'),
    sellingPrice: amount('selling price'),
    gstPercent: z.number({ error: 'Select a GST rate' }),
    stock: wholeNumber('stock'),
    pv: wholeNumber('PV'),
    unit: z.string().min(1, 'Select the pack size'),
    status: z.enum(['active', 'inactive']),
    description: z.string().trim().max(500, 'Keep the description under 500 characters'),
  })
  .refine((product) => product.sellingPrice <= product.mrp, {
    path: ['sellingPrice'],
    message: 'Selling price cannot be higher than the MRP',
  })

export const emptyProductValues = {
  code: '',
  category: '',
  name: '',
  batch: '',
  hsn: '',
  mrp: '',
  sellingPrice: '',
  gstPercent: null,
  stock: '',
  pv: '',
  unit: '',
  status: 'active',
  description: '',
}

/** Form values (strings, as typed into the inputs) for an existing product. */
export function toProductFormValues(product) {
  return {
    code: product.code,
    category: product.category,
    name: product.name,
    batch: product.batch,
    hsn: product.hsn,
    mrp: Number(product.mrp).toFixed(2),
    sellingPrice: Number(product.sellingPrice).toFixed(2),
    gstPercent: product.gstPercent,
    stock: String(product.stock),
    pv: String(product.pv),
    unit: product.unit,
    status: product.status,
    description: product.description ?? '',
  }
}
