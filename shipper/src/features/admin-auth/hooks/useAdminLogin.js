import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { signedIn } from '@/app/store'
import { adminLogin } from '@/features/admin-auth/services/adminAuthService'

/** Signs an admin in. Cached data from any previous session is dropped before the new one starts. */
export function useAdminLogin() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminLogin,
    onSuccess: ({ user, accessToken }) => {
      queryClient.clear()
      dispatch(signedIn({ user, accessToken }))
    },
  })
}