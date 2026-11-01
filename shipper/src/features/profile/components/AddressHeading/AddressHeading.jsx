import Badge from '@/components/atoms/Badge'
import styles from './AddressHeading.module.scss'

/** "Home · Default" with its delivery check: the heading of a saved address or of an order's delivery address. */
export default function AddressHeading({ address }) {
  return (
    <div className={styles.heading}>
      <p className={styles.label}>
        {address.label}
        {address.isDefault && ' · Default'}
      </p>
      <Badge tone={address.verified ? 'success' : 'warning'}>{address.verified ? 'Verified' : 'Not verified'}</Badge>
    </div>
  )
}
