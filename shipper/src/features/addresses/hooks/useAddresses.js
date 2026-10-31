import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from '@/features/cart'
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/features/addresses/services/addressService'
 
export const addressKeys = {
  all: ['addresses'],
  list: () => ['addresses', 'list'],
}
 
/** Saved addresses of the signed-in customer, default address first. */
export function useAddresses({ enabled = true } = {}) {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: listAddresses,
    enabled,
    select: (items) => [...items].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
  })
}
 
// Any address change can alter delivery fees and ETAs, so cart quotes are refreshed too.
function useAddressMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
      queryClient.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
 
/** Creates a new address, or updates one when the payload contains an `id`. */
export const useSaveAddress = () => useAddressMutation((payload) => (payload.id ? updateAddress(payload) : createAddress(payload)))
export const useDeleteAddress = () => useAddressMutation(deleteAddress)
export const useSetDefaultAddress = () => useAddressMutation(setDefaultAddress)