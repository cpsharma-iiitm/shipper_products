import { paths } from '@/app/router/paths'
import { OrderHistory } from '@/features/orders'
import { AccountShell } from '@/features/profile'

export default function OrdersPage() {
  return (
    <AccountShell
      layout="wide"
      breadcrumbs={[{ label: 'My account', to: paths.profile }, { label: 'Orders' }]}
      title="Your orders, all in one place."
      description="Track the good things on their way, or find an old favourite."
    >
      <OrderHistory />
    </AccountShell>
  )
}
