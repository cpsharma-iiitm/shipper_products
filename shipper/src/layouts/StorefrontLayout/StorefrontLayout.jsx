import { Outlet } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import MobileTabBar from './MobileTabBar'
import StorefrontFooter from './StorefrontFooter'
import StorefrontHeader from './StorefrontHeader'
import styles from './StorefrontLayout.module.scss'

/** Customer shell: announcement bar, header with category navigation, page content, footer, mobile tab bar. */
export default function StorefrontLayout() {
  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <AnnouncementBar />
      <StorefrontHeader />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <StorefrontFooter />
      <MobileTabBar />
    </div>
  )
}
