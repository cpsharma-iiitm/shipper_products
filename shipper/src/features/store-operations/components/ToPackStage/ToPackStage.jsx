import { useState } from 'react'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { getErrorMessage } from '@/app/services'
import { useDisclosure } from '@/hooks/useDisclosure'
import QueueDrawer from '@/features/store-operations/components/QueueDrawer'
import StageGrid from '@/features/store-operations/components/StageGrid'
import { useStageQueue, useStoreOptions, useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import FinalVerification from './FinalVerification'
import InvoicePanel from './InvoicePanel'
import PackWorkbench from './PackWorkbench'

// Packing is done one order at a time, so the whole queue is loaded and the first order is shown.
const QUEUE_SIZE = 50
const QUEUE_PARAMS = { stage: 'to_pack', page: 1, pageSize: QUEUE_SIZE }

/** To Pack: check the contents of one order, record the parcel and seal it, then move on to the next. */
export default function ToPackStage() {
  const options = useStoreOptions()
  const queue = useStageQueue(QUEUE_PARAMS)
  const queueDrawer = useDisclosure()

  const rows = queue.data?.items ?? []
  const [chosen, setChosen] = useState(null)
  const active = rows.find((row) => row.orderNumber === chosen) ?? rows[0] ?? null
  const activeNumber = active?.orderNumber ?? null
  const activeIndex = active ? rows.indexOf(active) : -1
  const order = useWorkOrder(activeNumber)

  const previous = rows[activeIndex - 1]
  // The packed order leaves the queue, so the order that followed it takes its place on screen.
  const afterPacked = () => setChosen((rows[activeIndex + 1] ?? previous)?.orderNumber ?? null)

  let message
  if (queue.isError) {
    message = <ErrorState compact title="Couldn't load the pack queue" message={getErrorMessage(queue.error)} onRetry={queue.refetch} />
  } else if (queue.isPending || (activeNumber && order.isPending)) {
    message = <Skeleton height="18rem" radius="var(--sh-radius-lg)" />
  } else if (!active) {
    message = <EmptyState icon="check2-circle" title="Nothing to pack" description="Every picked order has been packed." />
  } else if (order.isError) {
    message = <ErrorState compact title="Couldn't load this order" message={getErrorMessage(order.error)} onRetry={order.refetch} />
  }

  return (
    <>
      {message ? (
        <Card padding="sm">{message}</Card>
      ) : (
        <StageGrid
          panelWidth="23.125rem"
          main={
            <PackWorkbench
              key={order.data.orderNumber}
              order={order.data}
              queueSize={queue.data.totalItems}
              packers={options.data?.packers ?? []}
              packagingTypes={options.data?.packagingTypes ?? []}
              hasPrevious={Boolean(previous)}
              onPrevious={() => setChosen(previous.orderNumber)}
              onViewQueue={queueDrawer.open}
              onPacked={afterPacked}
            />
          }
          aside={
            <>
              <FinalVerification order={order.data} />
              <InvoicePanel order={order.data} />
            </>
          }
        />
      )}
      <QueueDrawer
        open={queueDrawer.isOpen}
        onClose={queueDrawer.close}
        title="Pack queue"
        description="Open any order waiting to be packed."
        rows={rows}
        loading={queue.isPending}
        activeOrderNumber={activeNumber}
        onSelect={setChosen}
      />
    </>
  )
}
