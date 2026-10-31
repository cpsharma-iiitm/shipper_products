import { z } from 'zod'

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Choose why this order is being cancelled'),
})
