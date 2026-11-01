import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getFinancialReport, getOrderReconciliation, getReportOverview } from '@/features/reports/services/reportService'

export const reportKeys = {
  all: ['admin', 'reports'],
  overview: (params) => ['admin', 'reports', 'overview', params],
  financial: (params) => ['admin', 'reports', 'financial', params],
  reconciliation: (orderNumber) => ['admin', 'reports', 'reconciliation', orderNumber],
}

// Filters keep showing the previous report while the next one loads, so the screen does not jump.
export const useReportOverview = (params) =>
  useQuery({ queryKey: reportKeys.overview(params), queryFn: () => getReportOverview(params), placeholderData: keepPreviousData })

export const useFinancialReport = (params) =>
  useQuery({ queryKey: reportKeys.financial(params), queryFn: () => getFinancialReport(params), placeholderData: keepPreviousData })

export const useOrderReconciliation = (orderNumber) =>
  useQuery({
    queryKey: reportKeys.reconciliation(orderNumber),
    queryFn: () => getOrderReconciliation(orderNumber),
    enabled: Boolean(orderNumber),
    placeholderData: keepPreviousData,
  })
