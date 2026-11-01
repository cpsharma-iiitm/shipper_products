import { toast } from 'react-toastify'
import { pluralize } from '@/lib/format'

/**
 * Tells the user how a bulk action went. `result` is { succeeded: string[], failed: [{ orderNumber, reason }] };
 * `done` finishes the sentence "3 orders …".
 */
export function reportBulkResult({ succeeded, failed }, { done }) {
  if (succeeded.length > 0) toast.success(`${pluralize(succeeded.length, 'order')} ${done}.`)
  if (failed.length > 0) {
    toast.warning(`${pluralize(failed.length, 'order')} skipped. ${failed[0].orderNumber}: ${failed[0].reason}`)
  }
}
