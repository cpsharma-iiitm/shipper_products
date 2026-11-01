import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/atoms/StatusBadge'
import EmptyState from '@/components/molecules/EmptyState'
import { formatShortDate } from '@/lib/date'
import { QueueCard, useDocumentDownloads } from '@/features/store-operations'

/**
 * The searchable shipment table: consignment, order, customer, city, status and dates, a "Print label"
 * button per row and a bulk "Download labels" for the checked rows. Labels come from the shared
 * shipping-label download used by the order screens.
 */
export default function ShipmentsCard({ queue, page, pageSize, selection, searching, onPageChange, onOpen }) {
  const documents = useDocumentDownloads()
  const printing = documents.isPending ? documents.variables.orderNumbers : []
  const { selectedIds } = selection
  const rows = queue.data?.items ?? []

  const columns = [
    {
      key: 'consignment',
      header: 'Consignment ID',
      cell: (row) => (
        <Button variant="link" size="sm" onClick={() => onOpen(row.orderNumber)} aria-label={`View shipment ${row.shipment.consignmentId}`}>
          {row.shipment.consignmentId}
        </Button>
      ),
    },
    { key: 'order', header: 'Order', cell: (row) => row.orderNumber },
    { key: 'customer', header: 'Customer', cell: (row) => row.customerName },
    { key: 'city', header: 'City', cell: (row) => row.city },
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
    { key: 'dispatched', header: 'Dispatched', cell: (row) => formatShortDate(row.shipment.dispatchedAt) },
    { key: 'expected', header: 'Expected delivery', cell: (row) => formatShortDate(row.shipment.expectedDelivery) },
  ]

  return (
    <QueueCard
      title={`Shipments · ${queue.data?.totalItems ?? '…'}`}
      caption="Shipments handed to India Post, newest first"
      itemLabel="shipments"
      selectLabel="Select shipments"
      columns={columns}
      rows={rows}
      loading={queue.isPending}
      error={queue.error}
      onRetry={queue.refetch}
      selectedIds={selectedIds}
      onSelectionChange={selection.setSelectedIds}
      onRowClick={(row) => onOpen(row.orderNumber)}
      rowActions={(row) => (
        <Button
          variant="secondary"
          size="sm"
          leftIcon="printer"
          loading={printing.includes(row.orderNumber)}
          aria-label={`Print label for ${row.orderNumber}`}
          onClick={() => documents.mutate({ kind: 'label', orderNumbers: [row.orderNumber] })}
        >
          Print label
        </Button>
      )}
      actionsHeader="Label"
      getRowLabel={(row) => `${row.shipment.consignmentId} ${row.orderNumber}`}
      page={page}
      pageSize={pageSize}
      totalItems={queue.data?.totalItems ?? 0}
      onPageChange={onPageChange}
      emptyState={
        <EmptyState
          compact
          icon="truck"
          title="No shipments found"
          description={searching ? 'Try a different consignment ID, order, customer or city.' : 'Shipments appear here once an order is dispatched.'}
        />
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon="download"
          disabled={selectedIds.length === 0}
          loading={documents.isPending && printing.length > 1}
          onClick={() => documents.mutate({ kind: 'label', orderNumbers: selectedIds })}
        >
          Download labels{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </Button>
      }
    />
  )
}
