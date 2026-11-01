import Card from '@/components/atoms/Card'
import BreakdownBars from '@/features/reports/components/BreakdownBars'
import styles from './OrderStatusCard.module.scss'

/** Order mix of the period. `orderStatus` ({ totalOrders, items }) comes from the overview API. */
export default function OrderStatusCard({ orderStatus }) {
  return (
    <Card title="Order-status breakdown" padding="md" radius="md" className={styles.card}>
      <BreakdownBars items={orderStatus.items} />
    </Card>
  )
}
