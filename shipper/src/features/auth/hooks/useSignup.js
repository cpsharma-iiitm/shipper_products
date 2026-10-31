import { useMutation } from '@tanstack/react-query'
import { useStartSession } from '@/features/auth/hooks/useStartSession'
import { signup } from '@/features/auth/services/authService'

/** Creates a customer account and signs the new customer in. */
export function useSignup() {
  const startSession = useStartSession()
  return useMutation({ mutationFn: signup, onSuccess: startSession })
}
