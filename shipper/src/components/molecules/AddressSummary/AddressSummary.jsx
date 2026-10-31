import clsx from 'clsx'
import { formatAddress, formatMobile } from '@/lib/address'
import styles from './AddressSummary.module.scss'
/**
* Read-only delivery address: name · mobile on the first line, then the address as one muted block.
* Used by checkout, profile, order detail and the admin order panels.
* showContact: show "Aditi Sharma · +91 98765 43210" above the address (default true)
*/
export default function AddressSummary({ address, showContact = true, includeLandmark = false, className }) {
  if (!address) return null
  const contact = [address.name, address.mobile ? formatMobile(address.mobile) : null].filter(Boolean).join(' · ')
  return (
    <div className={clsx(styles.summary, className)}>
      {showContact && contact && <p className={styles.contact}>{contact}</p>}
      <p className={styles.address}>{formatAddress(address, { includeLandmark })}</p>
    </div>
  )
}