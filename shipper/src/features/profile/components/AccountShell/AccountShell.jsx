import clsx from 'clsx'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import PageHeader from '@/components/molecules/PageHeader'
import AccountNav from '@/features/profile/components/AccountNav'
import styles from './AccountShell.module.scss'

/**
 * Frame of every signed-in account screen: optional breadcrumbs, the page heading and the account navigation.
 *   layout="sidebar" (profile, wallet, saved): navigation in a column beside a content column of reading width
 *   layout="wide" (order list and order detail, as designed): full-width content; the navigation is a row of pills
 *     on small screens only, because the design reaches these pages through breadcrumbs
 *   showNav={false}: no navigation at all (a single order, where the breadcrumbs lead back)
 */
export default function AccountShell({ title, description, actions, breadcrumbs, layout = 'sidebar', showNav = true, children }) {
  const isSidebar = layout === 'sidebar'

  return (
    <div className={clsx('sh-container', styles.page)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className={styles.breadcrumbs} />}
      <PageHeader variant="storefront" title={title} description={description} actions={actions} className={styles.header} />

      <div className={clsx(styles.body, isSidebar && styles.withSidebar)}>
        {showNav && <AccountNav className={clsx(styles.nav, !isSidebar && styles.mobileOnly)} />}
        <div className={clsx(styles.content, isSidebar && styles.readingWidth)}>{children}</div>
      </div>
    </div>
  )
}
