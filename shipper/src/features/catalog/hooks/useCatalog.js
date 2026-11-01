import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import {
  getOffers,
  getProduct,
  listCategories,
  listProducts,
  listRelatedProducts,
  subscribeToNewsletter,
} from '@/features/catalog/services/catalogService'

export const catalogKeys = {
  all: ['catalog'],
  categories: () => ['catalog', 'categories'],
  products: (params) => ['catalog', 'products', params],
  product: (slug) => ['catalog', 'product', slug],
  related: (slug) => ['catalog', 'related', slug],
  offers: () => ['catalog', 'offers'],
}

export const useCategories = () => useQuery({ queryKey: catalogKeys.categories(), queryFn: listCategories })

/**
 * Catalogue page for the given filters. With `keepPrevious` the previous page stays on screen while
 * the next one loads (filtering and paging), so the grid does not collapse into skeletons each time.
 */
export function useProducts(params, { keepPrevious = false, enabled = true } = {}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => listProducts(params),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    enabled,
  })
}

export const useProduct = (slug) => useQuery({ queryKey: catalogKeys.product(slug), queryFn: () => getProduct(slug) })

export const useRelatedProducts = (slug) =>
  useQuery({ queryKey: catalogKeys.related(slug), queryFn: () => listRelatedProducts(slug) })

export const useOffers = () => useQuery({ queryKey: catalogKeys.offers(), queryFn: getOffers })

export const useNewsletterSignup = () => useMutation({ mutationFn: subscribeToNewsletter })
