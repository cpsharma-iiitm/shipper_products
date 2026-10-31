import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signedOut } from '@/app/store'
import { logout } from '@/features/auth/services/authService'

/**
 * Ends the session. The UI signs out even when the request fails (offline, expired session), so a
 * user is never stuck looking signed in. Cached server data is cleared so nothing leaks to the next user.
 */
export function useLogout({ redirectTo }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      dispatch(signedOut())
      queryClient.clear()
      navigate(redirectTo, { replace: true })
    },
  })
}
