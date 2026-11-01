import { useState } from 'react'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { getErrorMessage } from '@/app/services'
import { useDisclosure } from '@/hooks/useDisclosure'
import HeaderActions from '@/features/store-operations/components/HeaderActions'
import QueueDrawer from '@/features/store-operations/components/QueueDrawer'
import QueueToolbar from '@/features/store-operations/components/QueueToolbar'
import StageGrid from '@/features/store-operations/components/StageGrid'
import StageSummary from '@/features/store-operations/components/StageSummary'
import { usePickListDownload } from '@/features/store-operations/hooks/useDocumentDownloads'
import { useQueueQuery } from '@/features/store-operations/hooks/useQueueQuery'
import { useStageQueue, useStoreOptions, useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import DiscrepancyModal from './DiscrepancyModal'
import NextInQueue from './NextInQueue'
import PickConfirmation from './PickConfirmation'
import PickList from './PickList'
import ScanProductModal from './ScanProductModal'
import StockExceptions from './StockExceptions'

// The picker works one order at a time, so the whole queue is loaded and the first one is shown.
const QUEUE_SIZE = 50

/** To Pick: the pick list of one order at a time, in queue order, with a way to report stock discrepancies. */
export default function ToPickStage() {
  const options = useStoreOptions()
  const { state, params, update } = useQueueQuery({ defaults: { warehouse: 'lucknow', assignee: 'all' }, fixed: { stage: 'to_pick' }, pageSize: QUEUE_SIZE })
  const queue = useStageQueue(params)
  const pickListDownload = usePickListDownload()
  const queueDrawer = useDisclosure()
  const scanDialog = useDisclosure()
  const discrepancyDialog = useDisclosure()

  const rows = queue.data?.items ?? []
  const [chosen, setChosen] = useState(null)
  const active = rows.find((row) => row.orderNumber === chosen) ?? rows[0] ?? null
  const activeNumber = active?.orderNumber ?? null
  const activeIndex = active ? rows.indexOf(active) : -1
  const upcoming = rows.slice(activeIndex + 1, activeIndex + 3)
  const order = useWorkOrder(activeNumber)

  // Ticked lines belong to one order; choosing another starts from an empty list.
  const [picks, setPicks] = useState({ orderNumber: null, codes: [] })
  const pickedCodes = new Set(picks.orderNumber === activeNumber ? picks.codes : [])
  const setPicked = (codes) => setPicks({ orderNumber: activeNumber, codes: [...codes] })

  const summary = queue.data?.summary
  const summaryItems = [
    { key: 'orders', label: 'Orders to pick', value: summary?.ordersToPick },
    { key: 'units', label: 'Units requested', value: summary?.unitsRequested },
    { key: 'passed', label: 'Stock checks passed', value: summary?.stockChecksPassed },
    { key: 'attention', label: 'Needs attention', value: summary?.needsAttention },
  ]
  const warehouseOptions = (options.data?.warehouses ?? []).map((name) => ({ value: name.toLowerCase(), label: name }))
  const assigneeOptions = [{ value: 'all', label: 'All' }, ...(options.data?.assignees ?? []).map((name) => ({ value: name, label: name }))]
  const afterPicked = () => setChosen((upcoming[0] ?? rows[activeIndex - 1])?.orderNumber ?? null)

  let work
  if (queue.isError) {
    work = <ErrorState compact title="Couldn't load the pick queue" message={getErrorMessage(queue.error)} onRetry={queue.refetch} />
  } else if (queue.isPending || (activeNumber && order.isPending)) {
    work = <Skeleton height="16rem" radius="var(--sh-radius-lg)" />
  } else if (!active) {
    work = (
      <EmptyState
        icon="check2-circle"
        title="Nothing to pick"
        description={state.search ? 'No order in the pick queue matches your search.' : 'Every verified order has been picked.'}
      />
    )
  } else if (order.isError) {
    work = <ErrorState compact title="Couldn't load this order" message={getErrorMessage(order.error)} onRetry={order.refetch} />
  }

  return (
    <>
      <HeaderActions>
        <Button loading={pickListDownload.isPending} onClick={() => pickListDownload.mutate(params)}>
          Print pick list
        </Button>
      </HeaderActions>
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search SKU, order or bin location"
        searchLabel="Search the pick queue by SKU, order number or bin location"
        filters={[
          { key: 'warehouse', label: 'Warehouse', prefix: 'Warehouse:', options: warehouseOptions, value: state.warehouse, onChange: (warehouse) => update({ warehouse }), disabled: warehouseOptions.length < 2 },
          { key: 'assignee', label: 'Assignee', prefix: 'Assignee:', options: assigneeOptions, value: state.assignee, onChange: (assignee) => update({ assignee }) },
        ]}
      />
      <StageSummary label="To pick summary" items={summaryItems} />

      {work ? (
        <Card padding="sm">{work}</Card>
      ) : (
        <StageGrid
          panelWidth="20rem"
          main={
            <>
              <PickList order={order.data} pickedCodes={pickedCodes} onPickedChange={setPicked} onScan={scanDialog.open} />
              <NextInQueue rows={upcoming} totalItems={queue.data.totalItems} onSelect={setChosen} onViewAll={queueDrawer.open} />
            </>
          }
          aside={
            <>
              <PickConfirmation order={order.data} pickedCodes={pickedCodes} onPicked={afterPicked} onReportDiscrepancy={discrepancyDialog.open} />
              <StockExceptions exceptions={summary?.stockExceptions ?? []} onSelect={setChosen} />
            </>
          }
        />
      )}

      {order.data && (
        <>
          <ScanProductModal open={scanDialog.isOpen} onClose={scanDialog.close} lines={order.data.lines} pickedCodes={pickedCodes} onPickedChange={setPicked} />
          <DiscrepancyModal open={discrepancyDialog.isOpen} onClose={discrepancyDialog.close} order={order.data} />
        </>
      )}
      <QueueDrawer
        open={queueDrawer.isOpen}
        onClose={queueDrawer.close}
        title="Pick queue"
        description="Open any order waiting to be picked."
        rows={rows}
        loading={queue.isPending}
        activeOrderNumber={activeNumber}
        onSelect={setChosen}
      />
    </>
  )
}
