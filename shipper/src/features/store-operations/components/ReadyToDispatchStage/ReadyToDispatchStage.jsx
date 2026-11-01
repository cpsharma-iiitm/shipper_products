import { useState } from 'react'
import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/atoms/StatusBadge'
import { formatDate, formatTime } from '@/lib/date'
import { pluralize } from '@/lib/format'
import HeaderActions from '@/features/store-operations/components/HeaderActions'
import QueueCard from '@/features/store-operations/components/QueueCard'
import QueueToolbar from '@/features/store-operations/components/QueueToolbar'
import StageGrid from '@/features/store-operations/components/StageGrid'
import { useDocumentDownloads } from '@/features/store-operations/hooks/useDocumentDownloads'
import { useQueueQuery } from '@/features/store-operations/hooks/useQueueQuery'
import { useQueueSelection } from '@/features/store-operations/hooks/useQueueSelection'
import { useStageQueue, useStoreOptions } from '@/features/store-operations/hooks/useStoreOperations'
import { formatParcelWeight } from '@/features/store-operations/utils/formatParcel'
import DispatchManifestModal from './DispatchManifestModal'
import DispatchPanel from './DispatchPanel'
import styles from './ReadyToDispatchStage.module.scss'

const PAGE_SIZE = 6

const COLUMNS = [
  { key: 'order', header: 'Order / customer', cell: (row) => `${row.orderNumber} · ${row.customerName}` },
  { key: 'weight', header: 'Weight', cell: (row) => formatParcelWeight(row.weightKg) },
  { key: 'invoice', header: 'Invoice', cell: (row) => row.invoiceNumber },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <span className="d-inline-flex align-items-center gap-2">
        <StatusBadge status="packed" />
        {row.delay && <StatusBadge status="delayed" />}
        {row.onHold && <StatusBadge status="on_hold" />}
      </span>
    ),
  },
]

function pickupText({ at, parcels, weightKg }, today) {
  const day = formatDate(at) === formatDate(today) ? 'Today' : formatDate(at)
  return `Next India Post pickup: ${day}, ${formatTime(at)} · ${pluralize(parcels, 'parcel')} / ${formatParcelWeight(weightKg)}`
}

/** Ready to Dispatch: packed orders waiting for an India Post consignment ID and handoff. */
export default function ReadyToDispatchStage() {
  const options = useStoreOptions()
  const { state, params, filterKey, update, setPage } = useQueueQuery({ defaults: { asOf: null }, fixed: { stage: 'ready' }, pageSize: PAGE_SIZE })
  const queue = useStageQueue(params)
  const rows = queue.data?.items ?? []
  const selection = useQueueSelection(rows, filterKey)
  const documents = useDocumentDownloads()
  const [manifestOpen, setManifestOpen] = useState(false)

  const asOfDates = options.data?.asOfDates ?? []
  const asOfOptions = asOfDates.map((date, index) => ({ value: date, label: index === 0 ? 'Today' : index === 1 ? 'Yesterday' : formatDate(date) }))
  const carrierOptions = (options.data?.carriers ?? []).map(({ value, label }) => ({ value, label }))
  const print = (kind) => documents.mutate({ kind, orderNumbers: selection.selectedIds })
  const nothingSelected = selection.selectedIds.length === 0

  return (
    <>
      <HeaderActions>
        <Button onClick={() => setManifestOpen(true)}>Create dispatch manifest</Button>
      </HeaderActions>
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search packed orders or invoice"
        searchLabel="Search packed orders by order number, customer or invoice"
        filters={[
          { key: 'carrier', label: 'Carrier', prefix: 'Carrier:', options: carrierOptions, value: carrierOptions[0]?.value ?? null, disabled: carrierOptions.length < 2 },
          {
            key: 'asOf',
            label: 'Packed on or before',
            prefix: 'Packed:',
            options: asOfOptions,
            value: state.asOf ?? asOfDates[0] ?? null,
            onChange: (asOf) => update({ asOf }),
          },
        ]}
      />
      <StageGrid
        panelWidth="24.375rem"
        main={
          <QueueCard
            title={`Packed queue · ${queue.data?.totalItems ?? '…'} orders`}
            caption="Packed orders ready for dispatch"
            itemLabel="packed orders"
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
                <Button variant="secondary" size="sm" disabled={nothingSelected} loading={documents.isPending && documents.variables.kind === 'invoice'} onClick={() => print('invoice')}>
                  Print invoices
                </Button>
                <Button variant="secondary" size="sm" disabled={nothingSelected} loading={documents.isPending && documents.variables.kind === 'label'} onClick={() => print('label')}>
                  Print labels
                </Button>
              </>
            }
          >
            {queue.data?.summary.nextPickup && <p className={styles.pickup}>{pickupText(queue.data.summary.nextPickup, options.data?.today)}</p>}
          </QueueCard>
        }
        aside={<DispatchPanel orderNumber={selection.activeId} onDone={selection.reset} />}
      />
      <DispatchManifestModal open={manifestOpen} onClose={() => setManifestOpen(false)} selectedOrderNumbers={selection.selectedIds} onDone={selection.reset} />
    </>
  )
}
