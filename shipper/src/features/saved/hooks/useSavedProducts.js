import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/app/store'
import { listSavedProducts, saveProduct, unsaveProduct } from '@/features/saved/services/savedService'

export const savedKeys = {
  all: ['saved-products'],
  list: () => ['saved-products', 'list'],
}

/** Saved products of the signed-in customer (disabled, and empty, for signed-out visitors). */
export function useSavedProducts() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return useQuery({ queryKey: savedKeys.list(), queryFn: listSavedProducts, enabled: isAuthenticated })
}

/**
 * Heart toggle: `isSaved(code)` and `toggle(code)`. The list is updated optimistically so the heart
 * responds instantly, and refetched if the request fails. Callers redirect signed-out visitors to
 * the login page before calling `toggle`.
 */
export function useSavedProductToggle() {
  const queryClient = useQueryClient()
  const { data: items = [] } = useSavedProducts()
  const saved = new Set(items.map((item) => item.productCode))

  const mutation = useMutation({
    mutationFn: ({ productCode, shouldSave }) => (shouldSave ? saveProduct(productCode) : unsaveProduct(productCode)),
    onMutate: async ({ productCode, shouldSave }) => {
      await queryClient.cancelQueries({ queryKey: savedKeys.list() })
      queryClient.setQueryData(savedKeys.list(), (current = []) =>
        shouldSave ? [...current, { productCode, savedAt: new Date().toISOString() }] : current.filter((item) => item.productCode !== productCode),
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: savedKeys.all }),
  })

  return {
    isSaved: (productCode) => saved.has(productCode),
    toggle: (productCode) => mutation.mutate({ productCode, shouldSave: !saved.has(productCode) }),
    isPending: mutation.isPending,
  }
}
