import { z } from 'zod'

// Shape checks only: the backend re-validates the customer, address, stock and payment method.
export const purchaseSchema = z.object({
  customer: z
    .object({ code: z.string() })
    .loose()
    .nullable()
    .refine(Boolean, 'Find the customer first'),
  addressId: z.string().min(1, 'Choose a delivery address'),
  lines: z
    .array(
      z.object({
        productCode: z.string().min(1),
        name: z.string(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      }),
    )
    .min(1, 'Add at least one item'),
  useWallet: z.boolean(),
  paymentMethod: z.string().min(1, 'Choose a payment method'),
})
