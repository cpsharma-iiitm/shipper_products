import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardKeys } from '@/features/dashboard/hooks/useDashboard'
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  exportProducts,
  getProductOptions,
  importProducts,
  listProducts,
  updateProduct,
  uploadProductImage,
} from '@/features/products/services/productService'

export const productKeys = {
  all: ['admin', 'products'],
  list: (params) => ['admin', 'products', 'list', params],
  options: ['admin', 'products', 'options'],
}

export function useProducts(params) {
  return useQuery({ queryKey: productKeys.list(params), queryFn: () => listProducts(params), placeholderData: keepPreviousData })
}

/** Categories, pack sizes and GST rates the backend accepts; they change rarely. */
export function useProductOptions() {
  return useQuery({ queryKey: productKeys.options, queryFn: getProductOptions, staleTime: 10 * 60_000 })
}

// Stock, counts and alerts on other screens depend on the catalogue, so every change refreshes them too.
function useRefreshCatalogue() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ])
}

/**
 * Creates or updates a product, then uploads the chosen image. A failed upload does not undo the
 * saved product: the result reports it as `imageError` so the form can say so.
 */
export function useSaveProduct() {
  const refresh = useRefreshCatalogue()
  return useMutation({
    mutationFn: async ({ code, values, imageFile }) => {
      const saved = code ? await updateProduct(code, values) : await createProduct(values)
      if (!imageFile) return { product: saved, imageError: null }
      try {
        return { product: await uploadProductImage(saved.code, imageFile), imageError: null }
      } catch (error) {
        return { product: saved, imageError: error }
      }
    },
    onSuccess: refresh,
  })
}

export function useDeleteProduct() {
  const refresh = useRefreshCatalogue()
  return useMutation({ mutationFn: deleteProduct, onSuccess: refresh })
}

export function useBulkUpdateProducts() {
  const refresh = useRefreshCatalogue()
  return useMutation({ mutationFn: bulkUpdateProducts, onSuccess: refresh })
}

export function useImportProducts() {
  const refresh = useRefreshCatalogue()
  return useMutation({ mutationFn: importProducts, onSuccess: refresh })
}

/** Fetches every product matching the filters (not just the visible page) for an Excel export. */
export function useExportProducts() {
  return useMutation({ mutationFn: exportProducts })
}
