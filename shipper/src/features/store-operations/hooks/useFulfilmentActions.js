import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingKeys } from '@/features/shipping/hooks/useShipments'
import { storeOperationKeys } from '@/features/store-operations/hooks/useStoreOperations'
import {
  assignOwner,
  dispatchOrder,
  dispatchOrders,
  holdOrder,
  markPacked,
  markPicked,
  notifyCustomers,
  refreshTracking,
  reportStockException,
  resolveDelay,
  saveResolution,
  verifyOrder,
  verifyOrders,
} from '@/features/store-operations/services/storeOperationService'

// Every fulfilment action can move an order between queues, so counts, queues, panels and the shipments
// list are all refreshed afterwards.
function useFulfilmentMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeOperationKeys.all })
      queryClient.invalidateQueries({ queryKey: shippingKeys.all })
    },
  })
}

export const useVerifyOrder = () => useFulfilmentMutation(verifyOrder)
export const useVerifyOrders = () => useFulfilmentMutation(verifyOrders)
export const useHoldOrder = () => useFulfilmentMutation(holdOrder)
export const useReportStockException = () => useFulfilmentMutation(reportStockException)
export const useMarkPicked = () => useFulfilmentMutation(markPicked)
export const useMarkPacked = () => useFulfilmentMutation(markPacked)
export const useDispatchOrder = () => useFulfilmentMutation(dispatchOrder)
export const useDispatchOrders = () => useFulfilmentMutation(dispatchOrders)
export const useSaveResolution = () => useFulfilmentMutation(saveResolution)
export const useResolveDelay = () => useFulfilmentMutation(resolveDelay)
export const useAssignOwner = () => useFulfilmentMutation(assignOwner)
export const useNotifyCustomers = () => useFulfilmentMutation(notifyCustomers)
export const useRefreshTracking = () => useFulfilmentMutation(refreshTracking)
