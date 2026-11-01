import Card from '@/components/atoms/Card'
import AddressSummary from '@/components/molecules/AddressSummary'
import { AddressHeading } from '@/features/profile'
import styles from './DeliveryAddressCard.module.scss'

/** "Delivered to": the address stored with the order, plus any delivery instructions given at checkout. */
export default function DeliveryAddressCard({ address, instructions }) {
  return (
    <Card title="Delivered to" padding="md">
      <div className={styles.content}>
        <AddressHeading address={address} />
        <AddressSummary address={address} />
        {instructions && (
          <p className={styles.instructions}>
            <span className={styles.instructionsLabel}>Delivery instructions</span>
            {instructions}
          </p>
        )}
      </div>
    </Card>
  )
}
