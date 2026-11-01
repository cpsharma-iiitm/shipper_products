import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getQueue, getStageCounts, getStoreOptions, getWorkOrder } from '@/features/store-operations/services/storeOperationService'

export const storeOperationKeys = {
  all: ['admin', 'store-operations'],
  counts: () => [...storeOperationKeys.all, 'counts'],
  options: () => [...storeOperationKeys.all, 'options'],
  queue: (params) => [...storeOperationKeys.all, 'queue', params],
  order: (orderNumber) => [...storeOperationKeys.all, 'order', orderNumber],
}

/** Live order counts for the stage tabs (and the "beyond SLA" figure of the delayed header). */
export function useStageCounts() {
  return useQuery({ queryKey: storeOperationKeys.counts(), queryFn: getStageCounts, refetchInterval: 60_000 })
}

/** Team members, packaging types, carriers and calendar choices that populate the selects. */
export function useStoreOptions() {
  return useQuery({ queryKey: storeOperationKeys.options(), queryFn: getStoreOptions, staleTime: Infinity })
}

/** One page of a stage queue. The previous page stays on screen while the next one loads. */
export function useStageQueue(params, { enabled = true } = {}) {
  return useQuery({ queryKey: storeOperationKeys.queue(params), queryFn: () => getQueue(params), placeholderData: keepPreviousData, enabled })
}

/** The full work order behind a side panel. */
export function useWorkOrder(orderNumber) {
  return useQuery({
    queryKey: storeOperationKeys.order(orderNumber),
    queryFn: () => getWorkOrder(orderNumber),
    enabled: Boolean(orderNumber),
  })
}
