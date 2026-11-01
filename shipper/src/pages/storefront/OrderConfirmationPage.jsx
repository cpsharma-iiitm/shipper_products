import { useParams } from 'react-router-dom'
import { OrderConfirmation } from '@/features/checkout'

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()

  return (
    <div className="sh-container">
      <OrderConfirmation orderNumber={orderNumber} />
    </div>
  )
}
