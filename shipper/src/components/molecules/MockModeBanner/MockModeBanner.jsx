import { env } from '@/app/config/env'
import Icon from '@/components/atoms/Icon'
import styles from './MockModeBanner.module.scss'
/**
* DEV FIXTURES indicator. Visible whenever VITE_USE_MOCK_API=true so nobody mistakes simulated
* data (products, orders, payments, tracking) for a live integration. Renders nothing otherwise.
*/
export default function MockModeBanner() {
  if (!env.useMockApi) return null
  return (
    <div
      role="status"
      className={styles.banner}
      title="API responses are simulated by development fixtures. No real orders, payments or shipments are created."
    >
      <Icon name="database-fill-gear" />
      Mock data
    </div>
  )
}