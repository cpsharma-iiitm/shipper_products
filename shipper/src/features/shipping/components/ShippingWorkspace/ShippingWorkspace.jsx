import { useState } from 'react'
import PageHeader from '@/components/molecules/PageHeader'
import { QueueToolbar, useQueueQuery, useQueueSelection } from '@/features/store-operations'
import ShipmentDrawer from '@/features/shipping/components/ShipmentDrawer'
import ShipmentStatusCards from '@/features/shipping/components/ShipmentStatusCards'
import ShipmentsCard from '@/features/shipping/components/ShipmentsCard'
import { useShipments } from '@/features/shipping/hooks/useShipments'
import styles from './ShippingWorkspace.module.scss'

const PAGE_SIZE = 10

/** Shipping: every parcel handed to India Post, filterable by status, with label printing and tracking details. */
export default function ShippingWorkspace() {
  const { state, params, filterKey, update, setPage } = useQueueQuery({ defaults: { status: 'all' }, pageSize: PAGE_SIZE })
  const shipments = useShipments(params)
  const selection = useQueueSelection(shipments.data?.items ?? [], filterKey, { selectFirst: false })
  const [openOrder, setOpenOrder] = useState(null)

  return (
    <div className={styles.workspace}>
      <PageHeader title="Shipping" description="Follow every parcel handed to India Post and print shipping labels." />
      <ShipmentStatusCards byStatus={shipments.data?.summary.byStatus} selected={state.status} onSelect={(status) => update({ status })} />
      <QueueToolbar
        search={state.search}
        onSearchChange={(search) => update({ search })}
        searchPlaceholder="Search consignment ID, order, customer or city"
        searchLabel="Search shipments by consignment ID, order number, customer or city"
      />
      <ShipmentsCard
        queue={shipments}
        page={state.page}
        pageSize={PAGE_SIZE}
        selection={selection}
        searching={Boolean(params.search) || state.status !== 'all'}
        onPageChange={setPage}
        onOpen={setOpenOrder}
      />
      <ShipmentDrawer orderNumber={openOrder} onClose={() => setOpenOrder(null)} />
    </div>
  )
}
