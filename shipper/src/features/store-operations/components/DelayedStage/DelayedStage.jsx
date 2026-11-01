import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { getErrorMessage } from '@/app/services'
import { ISSUE_GROUPS, OTHER_ISSUE, PRIORITY_LABELS } from '@/features/store-operations/config/delays'
import HeaderActions from '@/features/store-operations/components/HeaderActions'
import QueueCard from '@/features/store-operations/components/QueueCard'
import QueueToolbar from '@/features/store-operations/components/QueueToolbar'
import StageGrid from '@/features/store-operations/components/StageGrid'
import StageSummary from '@/features/store-operations/components/StageSummary'
import { useNotifyCustomers } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useQueueExport } from '@/features/store-operations/hooks/useQueueExport'
import { useQueueQuery } from '@/features/store-operations/hooks/useQueueQuery'
import { useQueueSelection } from '@/features/store-operations/hooks/useQueueSelection'
import { useStageQueue, useStoreOptions } from '@/features/store-operations/hooks/useStoreOperations'
import { reportBulkResult } from '@/features/store-operations/utils/bulkResult'
import AssignOwnerModal from './AssignOwnerModal'
import ResolvePanel from './ResolvePanel'

const PAGE_SIZE = 6
const ISSUE_OPTIONS = [{ value: 'all', label: 'All' }, ...ISSUE_GROUPS.map((group) => ({ value: group.key, label: group.cardLabel })), { value: 'other', label: OTHER_ISSUE.cardLabel }]
const AGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '24', label: '24+ hours' },
  { value: '48', label: '48+ hours' },
]

const COLUMNS = [
  { key: 'order', header: 'Order / customer', cell: (row) => `${row.orderNumber} · ${row.customerName}` },
  { key: 'age', header: 'Age', cell: (row) => `${row.delay.ageHours}h` },
  { key: 'issue', header: 'Issue', cell: (row) => row.delay.label },
  { key: 'owner', header: 'Owner', cell: (row) => row.delay.owner },
  { key: 'priority', header: 'Priority', cell: (row) => PRIORITY_LABELS[row.delay.priority] ?? row.delay.priority },
]

const exceptionsSheet = (rows) => ({
  fileName: 'Delayed-orders',
  sheetName: 'Exceptions',
  title: 'Delayed orders and exceptions',
  columns: [
    { header: 'Order', key: 'orderNumber', width: 14 },
    { header: 'Customer', key: 'customerName', width: 24 },
    { header: 'Age (hours)', key: 'ageHours', width: 12, format: 'number' },
    { header: 'Issue', key: 'issue', width: 26 },
    { header: 'Owner', key: 'owner', width: 18 },
    { header: 'Priority', key: 'priority', width: 12 },
  ],
  rows: rows.map((row) => ({
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    ageHours: row.delay.ageHours,
    issue: row.delay.label,
    owner: row.delay.owner,
    priority: PRIORITY_LABELS[row.delay.priority] ?? row.delay.priority,
  })),
})

/** Delayed Orders: every order with an open exception, and the panel to assign, schedule and resolve it. */
export default function DelayedStage() {
  const options = useStoreOptions()
  const { state, params, filterKey, update, setPage } = useQueueQuery({ defaults: { issue: 'all', age: 'all', owner: 'all' }, fixed: { stage: 'delayed' }, pageSize: PAGE_SIZE })
  const queue = useStageQueue(params)
  const rows = queue.data?.items ?? []
  const selection = useQueueSelection(rows, filterKey)
  const exporter = useQueueExport(exceptionsSheet)
  const notify = useNotifyCustomers()
  const [assigning, setAssigning] = useState(false)
  const [notifying, setNotifying] = useState(false)

  const groups = queue.data?.summary.groups
  const summaryItems = [...ISSUE_GROUPS, ...(groups?.other > 0 ? [OTHER_ISSUE] : [])].map((group) => ({
    key: group.key,
    label: group.cardLabel,
    value: groups?.[group.key],
    tone: group.cardTone,
  }))
  const ownerOptions = [{ value: 'all', label: 'All' }, ...(options.data?.owners ?? []).map((owner) => ({ value: owner, label: owner }))]
  const nothingSelected = selection.selectedIds.length === 0

  const notifySelected = () =>
    notify.mutate(selection.selectedIds, {
      onSuccess: (result) => {
        reportBulkResult(result, { done: 'notified about the delay' })
        setNotifying(false)
      },
      onError: (error) => {
        setNotifying(false)
        toast.error(getErrorMessage(error))
      },
    })

  return (
    <>
      <HeaderActions>
        <Button loading={exporter.isPending} onClick={() => exporter.mutate(params)}>
          Export exceptions
        </Button>
      </HeaderActions>
      <StageSummary label="Delayed orders by issue" items={summaryItems} />
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search delayed order, customer or issue"
        searchLabel="Search delayed orders by order number, customer or issue"
        filters={[
          { key: 'issue', label: 'Issue', prefix: 'Issue:', options: ISSUE_OPTIONS, value: state.issue, onChange: (issue) => update({ issue }) },
          { key: 'age', label: 'Age', prefix: 'Age:', options: AGE_OPTIONS, value: state.age, onChange: (age) => update({ age }) },
          { key: 'owner', label: 'Owner', prefix: 'Owner:', options: ownerOptions, value: state.owner, onChange: (owner) => update({ owner }) },
        ]}
      />
      <StageGrid
        panelWidth="27.5rem"
        main={
          <QueueCard
            title="Exception queue"
            caption="Orders with an open exception"
            itemLabel="delayed orders"
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
              <>
                <Button variant="secondary" size="sm" disabled={nothingSelected} onClick={() => setAssigning(true)}>
                  Assign owner
                </Button>
                <Button variant="secondary" size="sm" disabled={nothingSelected} onClick={() => setNotifying(true)}>
                  Notify customers
                </Button>
              </>
            }
          />
        }
        aside={<ResolvePanel orderNumber={selection.activeId} onDone={selection.reset} />}
      />
      <AssignOwnerModal open={assigning} onClose={() => setAssigning(false)} orderNumbers={selection.selectedIds} owners={options.data?.owners ?? []} />
      <ConfirmDialog
        open={notifying}
        onClose={() => setNotifying(false)}
        onConfirm={notifySelected}
        loading={notify.isPending}
        title="Notify customers?"
        message={`${selection.selectedIds.length} ${selection.selectedIds.length === 1 ? 'customer' : 'customers'} will be told their order is delayed and that you are working on it.`}
        confirmLabel="Send notifications"
      />
    </>
  )
}
