
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useDispatch } from 'react-redux'

import { userUpdated } from '@/app/store'

import { changePassword, getProfile, updateProfile } from '@/features/admin-profile/services/profileService'
 
export const profileKeys = { me: ['admin', 'profile'] }
 
export function useAdminProfile() {

  return useQuery({ queryKey: profileKeys.me, queryFn: getProfile })

}
 
/** Saves the profile and refreshes the name shown in the admin header. */

export function useUpdateProfile() {

  const queryClient = useQueryClient()

  const dispatch = useDispatch()

  return useMutation({

    mutationFn: updateProfile,

    onSuccess: (profile) => {

      queryClient.setQueryData(profileKeys.me, profile)

      dispatch(userUpdated({ name: profile.name, email: profile.email, mobile: profile.mobile }))

    },

  })

}
 
export function useChangePassword() {

  return useMutation({ mutationFn: changePassword })

}
 