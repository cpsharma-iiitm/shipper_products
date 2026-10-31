import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/app/services'
import { useStartSession } from '@/features/auth/hooks/useStartSession'
import { login } from '@/features/auth/services/authService'

/** Customer login. Admin accounts are sent to the admin login instead of being signed in here. */
export function useLogin() {
  const startSession = useStartSession()

  return useMutation({
    mutationFn: async (credentials) => {
      const session = await login({ ...credentials, scope: 'customer' })
      if (session.user.role !== 'customer') {
        throw new ApiError('This is an admin account. Please use the admin login.', { status: 403 })
      }
      return session
    },
    onSuccess: startSession,
  })
}
