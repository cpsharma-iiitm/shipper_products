import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import Drawer from '@/components/organisms/Drawer'
import { getErrorMessage } from '@/app/services'
import { ShipmentDetails, useWorkOrder } from '@/features/store-operations'
import styles from './ShipmentDrawer.module.scss'

/** Status, expected delivery and tracking timeline of the shipment chosen in the list. */
export default function ShipmentDrawer({ orderNumber, onClose }) {
  const query = useWorkOrder(orderNumber)

  let body
  if (query.isError) {
    body = <ErrorState compact title="Couldn't load this shipment" message={getErrorMessage(query.error)} onRetry={query.refetch} />
  } else if (!query.data) {
    body = (
      <div className={styles.loading} role="status" aria-label="Loading shipment">
        <Skeleton height="1rem" width="55%" />
        <Skeleton height="1rem" />
        <Skeleton height="8rem" />
      </div>
    )
  } else {
    body = <ShipmentDetails order={query.data} />
  }

  return (
    <Drawer open={Boolean(orderNumber)} onClose={onClose} title={`Shipment · #${orderNumber ?? ''}`} description="Follow this parcel with India Post.">
      {body}
    </Drawer>
  )
}
