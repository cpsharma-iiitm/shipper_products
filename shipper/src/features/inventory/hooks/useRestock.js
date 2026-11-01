import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listRestockItems } from '@/features/inventory/services/restockService'

export const restockKeys = {
  all: ['admin', 'restock'],
  list: (params) => ['admin', 'restock', 'list', params],
}

export const useRestockItems = (params) =>
  useQuery({ queryKey: restockKeys.list(params), queryFn: () => listRestockItems(params), placeholderData: keepPreviousData })
