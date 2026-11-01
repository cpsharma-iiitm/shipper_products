import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { exportToExcel } from '@/lib/excel'
import { getAllQueueRows } from '@/features/store-operations/services/storeOperationService'

/**
 * Exports every row matching a stage's current search and filters to an Excel file.
 *   const exporter = useQueueExport((rows) => ({ fileName, columns, rows: rows.map(…) }))
 *   exporter.mutate(params)
 * `buildSheet` receives the queue rows and returns the exportToExcel options. Figures are written as the
 * API supplied them.
 */
export function useQueueExport(buildSheet) {
  return useMutation({
    mutationFn: async (params) => {
      const rows = await getAllQueueRows(params)
      await exportToExcel(buildSheet(rows))
      return rows.length
    },
    onSuccess: (count) => toast.success(`Exported ${count} ${count === 1 ? 'row' : 'rows'} to Excel.`),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
