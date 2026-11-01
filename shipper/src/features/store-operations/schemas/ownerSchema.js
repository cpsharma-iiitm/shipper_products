import { z } from 'zod'
import { requiredText } from '@/lib/validation'

export const ownerSchema = z.object({ owner: requiredText('Choose a team member') })
