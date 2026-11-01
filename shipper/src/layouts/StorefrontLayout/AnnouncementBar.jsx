import { STOREFRONT } from '@/app/config/storefront'
import styles from './AnnouncementBar.module.scss'

export default function AnnouncementBar() {
  return (
    <p className={styles.bar}>
      <span>{STOREFRONT.announcement.lead}</span> <span>{STOREFRONT.announcement.detail}</span>
    </p>
  )
}
