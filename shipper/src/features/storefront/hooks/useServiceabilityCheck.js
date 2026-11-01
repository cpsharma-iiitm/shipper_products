import { useMutation } from '@tanstack/react-query'
import { checkServiceability } from '@/features/storefront/services/serviceabilityService'

/** Mutation wrapper so any component (header picker, product page) can check a PIN code. */
export function useServiceabilityCheck() {
  return useMutation({ mutationFn: checkServiceability })
}
