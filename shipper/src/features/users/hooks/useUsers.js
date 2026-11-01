import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, deleteUser, listUsers, setUserStatus, updateUser } from '@/features/users/services/userService'

export const userKeys = {
  all: ['admin', 'users'],
  list: (params) => ['admin', 'users', 'list', params],
}

export const useUsers = (params) => useQuery({ queryKey: userKeys.list(params), queryFn: () => listUsers(params), placeholderData: keepPreviousData })

/** Users and the roles' assigned counts change together, so every user mutation refreshes both. */
function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: userKeys.all }), queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] })]),
  })
}

export const useCreateUser = () => useUserMutation(createUser)
export const useUpdateUser = () => useUserMutation(updateUser)
export const useSetUserStatus = () => useUserMutation(setUserStatus)
export const useDeleteUser = () => useUserMutation(deleteUser)
