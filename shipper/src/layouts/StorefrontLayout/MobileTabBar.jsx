import { useSelector } from 'react-redux'
import { Link, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { CATEGORIES } from '@/app/config/categories'
import { paths } from '@/app/router/paths'
import { selectCartUnitCount, selectIsAuthenticated } from '@/app/store'
import Icon from '@/components/atoms/Icon'
import Drawer from '@/components/organisms/Drawer'
import { useDisclosure } from '@/hooks/useDisclosure'
import { pluralize } from '@/lib/format'
import styles from './MobileTabBar.module.scss'

const tabClass = ({ isActive }) => clsx(styles.tab, isActive && styles.active)

/** Bottom navigation for phones and tablets: Home, Categories, Cart, Account. */
export default function MobileTabBar() {
  const location = useLocation()
  const categories = useDisclosure()
  const cartUnits = useSelector(selectCartUnitCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const inCatalog = location.pathname.startsWith('/category') || location.pathname === paths.shop

  return (
    <>
      <nav aria-label="Primary" className={styles.bar}>
        <NavLink to={paths.home} end className={tabClass}>
          <Icon name="house" />
          Home
        </NavLink>
        <button type="button" className={clsx(styles.tab, inCatalog && styles.active)} onClick={categories.open}>
          <Icon name="grid" />
          Categories
        </button>
        <NavLink to={paths.cart} className={tabClass} aria-label={`Cart, ${pluralize(cartUnits, 'item')}`}>
          <Icon name="bag" />
          Cart
        </NavLink>
        <NavLink to={isAuthenticated ? paths.account : paths.login} className={tabClass}>
          <Icon name="person" />
          Account
        </NavLink>
      </nav>

      <Drawer open={categories.isOpen} onClose={categories.close} placement="bottom" title="Shop by category">
        <ul className={styles.categoryList}>
          <li>
            <Link to={paths.shop} className={styles.categoryLink} onClick={categories.close}>
              All products
              <Icon name="chevron-right" />
            </Link>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link to={paths.category(category.slug)} className={styles.categoryLink} onClick={categories.close}>
                {category.label}
                <Icon name="chevron-right" />
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  )
}
