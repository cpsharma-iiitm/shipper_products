import { useParams } from 'react-router-dom'
import { OrderDetail } from '@/features/admin-orders'

export default function AdminOrderDetailPage() {
  const { orderNumber } = useParams()
  return <OrderDetail key={orderNumber} orderNumber={orderNumber} />
}
