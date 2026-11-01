import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRole, deleteRole, listRoles, updateRole } from '@/features/users/services/roleService'

export const roleKeys = {
  all: ['admin', 'roles'],
}

export const useRoles = () => useQuery({ queryKey: roleKeys.all, queryFn: listRoles })

/** A role change can rename the role on user rows, so the users list is refreshed too. */
function useRoleMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: roleKeys.all }), queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })]),
  })
}

export const useCreateRole = () => useRoleMutation(createRole)
export const useUpdateRole = () => useRoleMutation(updateRole)
export const useDeleteRole = () => useRoleMutation(deleteRole)
