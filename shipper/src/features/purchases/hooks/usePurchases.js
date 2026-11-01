import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelPurchase,
  findCustomers,
  getPurchase,
  getPurchaseDraft,
  getPurchaseQuote,
  listPurchases,
  listSellableProducts,
  savePurchase,
} from '@/features/purchases/services/purchaseService'

export const purchaseKeys = {
  all: ['admin', 'purchases'],
  lists: ['admin', 'purchases', 'list'],
  list: (params) => ['admin', 'purchases', 'list', params],
  draft: ['admin', 'purchases', 'draft'],
  items: ['admin', 'purchases', 'item'],
  item: (purchaseNumber) => ['admin', 'purchases', 'item', purchaseNumber],
  products: ['admin', 'purchases', 'products'],
  quote: (request) => ['admin', 'purchases', 'quote', request],
}

export function usePurchases(params) {
  return useQuery({ queryKey: purchaseKeys.list(params), queryFn: () => listPurchases(params), placeholderData: keepPreviousData })
}

/**
 * The next draft number and the payment methods the backend offers. It is fetched once per visit to the
 * form and never refreshed underneath it (a new number mid-edit would reset the form), so it is dropped
 * as soon as the form closes and saving does not invalidate it.
 */
export function usePurchaseDraft() {
  return useQuery({ queryKey: purchaseKeys.draft, queryFn: getPurchaseDraft, gcTime: 0, staleTime: Infinity, refetchOnWindowFocus: false })
}

/** A saved purchase, loaded to continue editing a draft. */
export function usePurchase(purchaseNumber) {
  return useQuery({ queryKey: purchaseKeys.item(purchaseNumber), queryFn: () => getPurchase(purchaseNumber), enabled: Boolean(purchaseNumber) })
}

export function useCustomerLookup() {
  return useMutation({ mutationFn: findCustomers })
}

/** Products an admin can add to a purchase right now (active and in stock). */
export function useSellableProducts() {
  return useQuery({ queryKey: purchaseKeys.products, queryFn: listSellableProducts, staleTime: 60_000 })
}

/**
 * Backend price quote for the current form. Nothing is added up on the client; the previous quote
 * stays on screen while a new one loads. `request` is null until a customer and address are chosen.
 */
export function usePurchaseQuote(request) {
  return useQuery({
    queryKey: purchaseKeys.quote(request),
    queryFn: () => getPurchaseQuote(request),
    enabled: request !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

// The purchase list and any open draft are refreshed; the form's own draft number is left alone (see above).
function refreshPurchases(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: purchaseKeys.lists }),
    queryClient.invalidateQueries({ queryKey: purchaseKeys.items }),
  ])
}

export function useSavePurchase() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: savePurchase, onSuccess: () => refreshPurchases(queryClient) })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: cancelPurchase, onSuccess: () => refreshPurchases(queryClient) })
}
