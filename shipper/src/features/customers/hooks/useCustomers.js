import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCustomer, listCustomerOptions, listCustomers } from '@/features/customers/services/customerService'

export const customerKeys = {
  all: ['admin', 'customers'],
  list: (params) => ['admin', 'customers', 'list', params],
  options: ['admin', 'customers', 'options'],
  detail: (code) => ['admin', 'customers', 'detail', code],
}

export const useCustomers = (params) =>
  useQuery({ queryKey: customerKeys.list(params), queryFn: () => listCustomers(params), placeholderData: keepPreviousData })

export const useCustomerOptions = () => useQuery({ queryKey: customerKeys.options, queryFn: listCustomerOptions, staleTime: 5 * 60_000 })

export const useCustomer = (code) => useQuery({ queryKey: customerKeys.detail(code), queryFn: () => getCustomer(code) })
