import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { restockKeys } from '@/features/inventory/hooks/useRestock'
import { createRestockRequest } from '@/features/inventory/services/restockService'
import { pluralize } from '@/lib/format'

/** Raises a restock request for the given lines ([{ productCode, quantity }]) and refreshes the list. */
export function useRequestRestock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRestockRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: restockKeys.all })
      toast.success(`Restock request ${request.id} raised for ${pluralize(request.items.length, 'product')}.`)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
