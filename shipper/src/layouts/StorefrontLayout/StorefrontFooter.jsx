import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/app/config/categories'
import { POLICY_PAGES, STOREFRONT } from '@/app/config/storefront'
import { paths } from '@/app/router/paths'
import Logo from '@/components/atoms/Logo'
import styles from './StorefrontFooter.module.scss'

export default function StorefrontFooter() {
  return (
    <footer className={styles.footer}>
      <div className="sh-container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo as={Link} to={paths.home} inverted aria-label="Shipper.com home" />
            <p className={styles.tagline}>{STOREFRONT.tagline}</p>
            <p className={styles.contact}>
              <a href={`mailto:${STOREFRONT.supportEmail}`}>{STOREFRONT.supportEmail}</a> · {STOREFRONT.supportPhone}
            </p>
          </div>

          <nav aria-label="Shop" className={styles.links}>
            <h2 className={styles.heading}>
              <Link to={paths.shop}>Shop</Link>
            </h2>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link to={paths.category(category.slug)}>{category.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Your Shipper" className={styles.links}>
            <h2 className={styles.heading}>Your Shipper</h2>
            <ul>
              <li>
                <Link to={paths.profile}>My account</Link>
              </li>
              <li>
                <Link to={paths.orders}>My orders</Link>
              </li>
              <li>
                <Link to={paths.track}>Track shipment</Link>
              </li>
              <li>
                <Link to={paths.wallet}>Wallet &amp; rewards</Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Help" className={styles.links}>
            <h2 className={styles.heading}>Here to help</h2>
            <ul>
              {POLICY_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link to={paths.policy(page.slug)}>{page.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 Shipper.com. Made for everyday India.</p>
          <ul className={styles.payments} aria-label="Accepted payment methods">
            {STOREFRONT.paymentMethods.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
