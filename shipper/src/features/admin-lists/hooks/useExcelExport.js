import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { exportToExcel } from '@/lib/excel'
 
/**
 * Downloads an .xlsx of rows the screen already shows or can fetch.
 *   const exporter = useExcelExport()
 *   exporter.mutate({ fileName, sheetName, title, columns, getRows: async () => rows })
 * `getRows` is called when the button is pressed, so a list can fetch every matching page first.
 */
export function useExcelExport() {
  return useMutation({
    mutationFn: async ({ getRows, ...sheet }) => {
      const rows = await getRows()
      await exportToExcel({ ...sheet, rows })
      return rows.length
    },
    onSuccess: (count) => toast.success(`Excel file downloaded with ${count} ${count === 1 ? 'row' : 'rows'}.`),
    onError: (error) => toast.error(getErrorMessage(error, 'We could not create the Excel file. Please try again.')),
  })
}