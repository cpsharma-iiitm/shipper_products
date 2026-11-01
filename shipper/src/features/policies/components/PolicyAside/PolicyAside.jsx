import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { POLICY_PAGES, STOREFRONT } from '@/app/config/storefront'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import styles from './PolicyAside.module.scss'

/** Beside a policy: the other policies and how to reach support (the details shown in the footer). */
export default function PolicyAside() {
  return (
    <aside className={styles.aside} aria-label="More help">
      <nav aria-label="Policies" className={styles.policies}>
        <h2 className={styles.heading}>Our policies</h2>
        <ul>
          {POLICY_PAGES.map((page) => (
            <li key={page.slug}>
              <NavLink to={paths.policy(page.slug)} className={({ isActive }) => clsx(styles.link, isActive && styles.active)}>
                {page.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Card title="Here to help" padding="md" titleAs="h2">
        <p className={styles.contact}>
          Questions about an order, a delivery or a refund? <a href={`mailto:${STOREFRONT.supportEmail}`}>{STOREFRONT.supportEmail}</a> or call{' '}
          <span className={styles.phone}>{STOREFRONT.supportPhone}</span>.
        </p>
        <Link to={paths.track} className={styles.trackLink}>
          Track a shipment
        </Link>
      </Card>
    </aside>
  )
}
