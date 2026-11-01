import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { CATEGORIES } from '@/app/config/categories'
import { paths } from '@/app/router/paths'
import Icon from '@/components/atoms/Icon'
import Popover from '@/components/molecules/Popover'
import styles from './CategoryNav.module.scss'

const linkClass = ({ isActive }) => clsx(styles.link, isActive && styles.active)

export default function CategoryNav() {
  return (
    <nav aria-label="Categories" className={styles.nav}>
      <div className={clsx('sh-container', styles.inner)}>
        <ul className={styles.list}>
          <li>
            <Popover
              trigger={({ props, isOpen }) => (
                <button type="button" className={clsx(styles.link, styles.trigger, isOpen && styles.active)} {...props}>
                  All categories
                  <Icon name="chevron-down" />
                </button>
              )}
            >
              {({ close }) => (
                <ul className={styles.menu}>
                  <li>
                    <Link to={paths.shop} className={styles.menuLink} onClick={close}>
                      All products
                    </Link>
                  </li>
                  {CATEGORIES.map((category) => (
                    <li key={category.slug}>
                      <Link to={paths.category(category.slug)} className={styles.menuLink} onClick={close}>
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Popover>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <NavLink to={paths.category(category.slug)} className={linkClass}>
                {category.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to={paths.offers} className={({ isActive }) => clsx(styles.link, styles.offers, isActive && styles.active)}>
              Today’s offers
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}
