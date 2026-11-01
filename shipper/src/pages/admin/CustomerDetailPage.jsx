import { useParams } from 'react-router-dom'
import { CustomerDetail } from '@/features/customers'

export default function CustomerDetailPage() {
  const { code } = useParams()
  return <CustomerDetail key={code} code={code} />
}
