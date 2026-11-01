import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/atoms/StatusBadge'
import { getErrorMessage } from '@/app/services'
import { formatDate, formatShortDate, formatTime } from '@/lib/date'
import HeaderActions from '@/features/store-operations/components/HeaderActions'
import QueueCard from '@/features/store-operations/components/QueueCard'
import QueueToolbar from '@/features/store-operations/components/QueueToolbar'
import StageGrid from '@/features/store-operations/components/StageGrid'
import { useRefreshTracking } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useQueueExport } from '@/features/store-operations/hooks/useQueueExport'
import { useQueueQuery } from '@/features/store-operations/hooks/useQueueQuery'
import { useQueueSelection } from '@/features/store-operations/hooks/useQueueSelection'
import { useStageQueue, useStoreOptions } from '@/features/store-operations/hooks/useStoreOperations'
import ShipmentPanel from './ShipmentPanel'
import styles from './DispatchedStage.module.scss'

const PAGE_SIZE = 7
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
]

const COLUMNS = [
  { key: 'order', header: 'Order / customer', cell: (row) => `${row.orderNumber} · ${row.customerName}` },
  { key: 'consignment', header: 'India Post ID', cell: (row) => row.shipment.consignmentId },
  { key: 'dispatched', header: 'Dispatch', cell: (row) => formatShortDate(row.shipment.dispatchedAt) },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <span className="d-inline-flex align-items-center gap-2">
        <StatusBadge status={row.shipment.status} />
        {row.delay && <StatusBadge status="delayed" />}
      </span>
    ),
  },
]

const shipmentsSheet = (rows) => ({
  fileName: 'Shipments',
  sheetName: 'Shipments',
  title: 'Shipments dispatched in the last 14 days',
  columns: [
    { header: 'Order', key: 'orderNumber', width: 14 },
    { header: 'Customer', key: 'customerName', width: 24 },
    { header: 'India Post ID', key: 'consignmentId', width: 18 },
    { header: 'Service', key: 'service', width: 18 },
    { header: 'Dispatched', key: 'dispatchedAt', width: 14, format: 'date' },
    { header: 'Expected delivery', key: 'expectedDelivery', width: 18, format: 'date' },
    { header: 'Status', key: 'status', width: 16 },
  ],
  rows: rows.map((row) => ({
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    consignmentId: row.shipment.consignmentId,
    service: row.shipment.service,
    dispatchedAt: row.shipment.dispatchedAt,
    expectedDelivery: row.shipment.expectedDelivery,
    status: row.shipment.status,
  })),
})

/** Dispatched: shipments handed to India Post in the last 14 days, with the tracking timeline of the selected one. */
export default function DispatchedStage() {
  const options = useStoreOptions()
  const { state, params, filterKey, update, setPage } = useQueueQuery({ defaults: { status: 'all' }, fixed: { stage: 'dispatched' }, pageSize: PAGE_SIZE })
  const queue = useStageQueue(params)
  const rows = queue.data?.items ?? []
  const selection = useQueueSelection(rows, filterKey)
  const refresh = useRefreshTracking()
  const exporter = useQueueExport(shipmentsSheet)

  const carrierOptions = (options.data?.carriers ?? []).map(({ value, label }) => ({ value, label }))
  const syncedAt = queue.data?.summary.trackingSyncedAt

  return (
    <>
      <HeaderActions>
        <Button loading={exporter.isPending} onClick={() => exporter.mutate(params)}>
          Export shipments
        </Button>
      </HeaderActions>
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search order or tracking ID"
        searchLabel="Search shipments by order number, customer or tracking ID"
        filters={[
          { key: 'status', label: 'Shipment status', prefix: 'Status:', options: STATUS_OPTIONS, value: state.status, onChange: (status) => update({ status }) },
          { key: 'carrier', label: 'Carrier', prefix: 'Carrier:', options: carrierOptions, value: carrierOptions[0]?.value ?? null, disabled: carrierOptions.length < 2 },
        ]}
      />
      <StageGrid
        panelWidth="24.375rem"
        main={
          <QueueCard
            title={`Shipment list · ${queue.data?.totalItems ?? '…'}`}
            caption="Shipments dispatched in the last 14 days"
            itemLabel="shipments"
            selectLabel="Select shipments"
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
              <Button
                variant="secondary"
                size="sm"
                loading={refresh.isPending}
                onClick={() =>
                  refresh.mutate(undefined, {
                    onSuccess: () => toast.success('Tracking refreshed.'),
                    onError: (error) => toast.error(getErrorMessage(error)),
                  })
                }
              >
                Refresh tracking
              </Button>
            }
          >
            {syncedAt && (
              <p className={styles.synced}>
                Tracking synced {formatDate(syncedAt)} at {formatTime(syncedAt)}
              </p>
            )}
          </QueueCard>
        }
        aside={<ShipmentPanel orderNumber={selection.activeId} />}
      />
    </>
  )
}
