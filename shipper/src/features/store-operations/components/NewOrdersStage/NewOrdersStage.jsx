import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/atoms/StatusBadge'
import { getErrorMessage } from '@/app/services'
import { formatDate, formatTime } from '@/lib/date'
import { formatINR } from '@/lib/format'
import StageGrid from '@/features/store-operations/components/StageGrid'
import QueueCard from '@/features/store-operations/components/QueueCard'
import QueueToolbar from '@/features/store-operations/components/QueueToolbar'
import { useVerifyOrders } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useQueueQuery } from '@/features/store-operations/hooks/useQueueQuery'
import { useQueueSelection } from '@/features/store-operations/hooks/useQueueSelection'
import { useStageQueue, useStoreOptions } from '@/features/store-operations/hooks/useStoreOperations'
import { reportBulkResult } from '@/features/store-operations/utils/bulkResult'
import VerifyPanel from './VerifyPanel'

const PAGE_SIZE = 6
const PAYMENT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const COLUMNS = [
  { key: 'order', header: 'Order / customer', cell: (row) => `${row.orderNumber} · ${row.customerName}` },
  { key: 'time', header: 'Time', cell: (row) => formatTime(row.placedAt) },
  { key: 'units', header: 'Units', cell: (row) => row.units },
  { key: 'gross', header: 'Gross', cell: (row) => formatINR(row.grossAmount) },
  {
    key: 'payment',
    header: 'Payment',
    cell: (row) => (
      <span className="d-inline-flex align-items-center gap-2">
        <StatusBadge status={row.paymentStatus} />
        {row.onHold && <StatusBadge status="on_hold" />}
      </span>
    ),
  },
]

/** New Orders: verify payment and stock, then release the order to the warehouse (it moves to To Pick). */
export default function NewOrdersStage() {
  const options = useStoreOptions()
  const { state, params, filterKey, update, setPage } = useQueueQuery({ defaults: { payment: 'all', asOf: null }, fixed: { stage: 'new' }, pageSize: PAGE_SIZE })
  const queue = useStageQueue(params)
  const rows = queue.data?.items ?? []
  const selection = useQueueSelection(rows, filterKey)
  const verifyMany = useVerifyOrders()

  const asOfDates = options.data?.asOfDates ?? []
  const asOfOptions = asOfDates.map((date) => ({ value: date, label: formatDate(date) }))

  const verifySelected = () =>
    verifyMany.mutate(selection.selectedIds, {
      onSuccess: (result) => {
        reportBulkResult(result, { done: 'verified and moved to To Pick' })
        selection.reset()
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })

  return (
    <>
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search order, customer or PIN"
        searchLabel="Search new orders by order number, customer or PIN"
        filters={[
          { key: 'payment', label: 'Payment status', prefix: 'Payment:', options: PAYMENT_OPTIONS, value: state.payment, onChange: (payment) => update({ payment }) },
          {
            key: 'asOf',
            label: 'Orders placed on or before',
            options: asOfOptions,
            value: state.asOf ?? asOfDates[0] ?? null,
            onChange: (asOf) => update({ asOf }),
          },
        ]}
      />
      <StageGrid
        panelWidth="23.875rem"
        main={
          <QueueCard
            title={`New Orders · ${queue.data?.totalItems ?? '…'}`}
            caption="New orders waiting for verification"
            itemLabel="orders"
            selectLabel="Select orders"
            columns={COLUMNS}
            rows={rows}
            loading={queue.isPending}
            error={queue.error}
            onRetry={queue.refetch}
            selectedIds={selection.selectedIds}
            onSelectionChange={selection.setSelectedIds}
            onRowClick={selection.focusRow}
            getRowLabel={(row) => `${row.orderNumber} ${row.customerName}`}
            page={state.page}
            pageSize={PAGE_SIZE}
            totalItems={queue.data?.totalItems ?? 0}
            onPageChange={setPage}
            actions={
              <Button variant="secondary" size="sm" disabled={selection.selectedIds.length === 0} loading={verifyMany.isPending} onClick={verifySelected}>
                Bulk verify
              </Button>
            }
          />
        }
        aside={<VerifyPanel orderNumber={selection.activeId} onDone={selection.reset} />}
      />
    </>
  )
}
