import Card from '@/components/atoms/Card'
import DeliveryAddressCard from '@/features/orders/components/DeliveryAddressCard'
import OrderHeroCard from '@/features/orders/components/OrderHeroCard'
import ParcelItemsCard from '@/features/orders/components/ParcelItemsCard'
import PaymentSummaryCard from '@/features/orders/components/PaymentSummaryCard'
import ReorderStrip from '@/features/orders/components/ReorderStrip'
import SupportCard from '@/features/orders/components/SupportCard'
import { useReorder } from '@/features/orders/hooks/useReorder'
import { ShipmentTracker } from '@/features/tracking'
import styles from './OrderDetail.module.scss'

/**
 * Everything on an order page below its heading: delivery status and tracking, the items, the delivery
 * address, the payment summary and reorder. Money and dates are displayed exactly as the backend stored them.
 * On phones the cards read as a single column (tracking, items, address, payment, reorder, help); from `lg`
 * the tracking and help cards form a left column beside the rest.
 */
export default function OrderDetail({ order }) {
  const reorder = useReorder()

  return (
    <div className={styles.layout}>
      <OrderHeroCard order={order} />

      <div className={styles.side}>
        <Card title="Track your delivery" padding="md" className={styles.track}>
          <ShipmentTracker shipment={order.shipment} timeline={order.timeline} />
        </Card>
        <SupportCard orderNumber={order.orderNumber} className={styles.support} />
      </div>

      <div className={styles.main}>
        <ParcelItemsCard lines={order.lines} className={styles.parcel} />
        <div className={styles.pair}>
          <DeliveryAddressCard address={order.address} instructions={order.deliveryInstructions} />
          <PaymentSummaryCard order={order} />
        </div>
        <ReorderStrip className={styles.reorder} disabled={!order.canReorder} onReorder={() => reorder(order.lines)} />
      </div>
    </div>
  )
}
