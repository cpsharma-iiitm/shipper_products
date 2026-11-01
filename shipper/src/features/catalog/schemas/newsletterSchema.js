import { z } from 'zod'
import { emailSchema } from '@/lib/validation'

export const newsletterSchema = z.object({ email: emailSchema })
