import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { downloadInvoice, downloadShippingLabel } from '@/features/orders'
import { pluralize } from '@/lib/format'
import { downloadPickList } from '@/features/store-operations/services/storeOperationService'

const DOCUMENTS = {
  invoice: { download: downloadInvoice, noun: 'invoice' },
  label: { download: downloadShippingLabel, noun: 'label' },
}

/**
 * Downloads the invoice or shipping label of one or more orders through the shared document services.
 *   const documents = useDocumentDownloads()
 *   documents.mutate({ kind: 'label', orderNumbers: ['SH10488'] })
 * Files are fetched one after another so the browser is not flooded with simultaneous downloads.
 */
export function useDocumentDownloads() {
  return useMutation({
    mutationFn: async ({ kind, orderNumbers }) => {
      for (const orderNumber of orderNumbers) await DOCUMENTS[kind].download(orderNumber)
    },
    onSuccess: (_result, { kind, orderNumbers }) => {
      toast.success(`${pluralize(orderNumbers.length, DOCUMENTS[kind].noun)} downloaded.`)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

/** Downloads the consolidated pick list of the To Pick queue for the current filters. */
export function usePickListDownload() {
  return useMutation({
    mutationFn: downloadPickList,
    onSuccess: () => toast.success('Pick list downloaded.'),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
