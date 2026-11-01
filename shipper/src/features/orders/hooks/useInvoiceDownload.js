import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { downloadInvoice } from '@/features/orders/services/documentService'

/** Downloads an order's invoice. `variables` holds the order number being fetched, for per-order busy states. */
export function useInvoiceDownload() {
  return useMutation({
    mutationFn: downloadInvoice,
    onError: (error) => toast.error(getErrorMessage(error, 'We could not download the invoice. Please try again.')),
  })
}
