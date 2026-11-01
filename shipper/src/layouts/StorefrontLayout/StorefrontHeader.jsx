import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { selectCartUnitCount, selectIsAuthenticated } from '@/app/store'
import Icon from '@/components/atoms/Icon'
import Logo from '@/components/atoms/Logo'
import SearchField from '@/components/molecules/SearchField'
import DeliveryLocation from '@/features/storefront/components/DeliveryLocation'
import { pluralize } from '@/lib/format'
import CategoryNav from './CategoryNav'
import styles from './StorefrontHeader.module.scss'

export default function StorefrontHeader() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // The field shows the active ?q= search; text typed since then wins until the URL's query changes.
  const urlQuery = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState(null)
  const query = draft && draft.base === urlQuery ? draft.text : urlQuery
  const cartUnits = useSelector(selectCartUnitCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const search = (value) => {
    const trimmed = value.trim()
    navigate({ pathname: paths.shop, search: trimmed ? `?q=${encodeURIComponent(trimmed)}` : '' })
  }

  return (
    <header className={styles.header}>
      <div className={`sh-container ${styles.bar}`}>
        <Logo as={Link} to={paths.home} aria-label="Shipper.com home" className={styles.logo} />

        <SearchField
          className={styles.search}
          variant="filled"
          value={query}
          onChange={(text) => setDraft({ text, base: urlQuery })}
          onSubmit={search}
          placeholder="Search for haldi, shampoo, everyday essentials…"
          aria-label="Search products"
        />

        <div className={styles.deliver}>
          <span className={styles.desktopOnly}>
            <DeliveryLocation variant="header" />
          </span>
        </div>

        <Link
          to={isAuthenticated ? paths.profile : paths.login}
          className={styles.iconLink}
          aria-label={isAuthenticated ? 'My account' : 'Log in or sign up'}
        >
          <Icon name="person" />
        </Link>

        <Link to={paths.cart} className={styles.cartLink} aria-label={`Cart, ${pluralize(cartUnits, 'item')}`}>
          <Icon name="bag" />
          <span className={styles.cartLabel}>Cart ({cartUnits})</span>
        </Link>

        <div className={styles.deliverInline}>
          <DeliveryLocation variant="inline" />
        </div>
      </div>
      <CategoryNav />
    </header>
  )
}
