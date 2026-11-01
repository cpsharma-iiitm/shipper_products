import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { userUpdated } from '@/app/store'
import { changePassword, getProfile, updateProfile } from '@/features/profile/services/profileService'

export const profileKeys = {
  all: ['profile'],
  detail: () => ['profile', 'detail'],
}

export function useProfile() {
  return useQuery({ queryKey: profileKeys.detail(), queryFn: getProfile })
}

/** Saves the personal details and mirrors them into the signed-in user the header and greeting read from. */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(), profile)
      dispatch(userUpdated({ name: profile.name, email: profile.email, mobile: profile.mobile }))
    },
  })
}

export const useChangePassword = () => useMutation({ mutationFn: changePassword })
