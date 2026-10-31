import { useQuery } from '@tanstack/react-query'
import { checkMobileAvailability } from '@/features/auth/services/authService'

export const authKeys = {
  mobileAvailability: (mobile) => ['auth', 'mobile-availability', mobile],
}

/** Whether a (valid, normalised) mobile number is free to register. Pass '' to skip the check. */
export function useMobileAvailability(mobile) {
  return useQuery({
    queryKey: authKeys.mobileAvailability(mobile),
    queryFn: () => checkMobileAvailability(mobile),
    enabled: mobile !== '',
    staleTime: 60_000,
  })
}
