import { Link, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { CATEGORIES } from '@/app/config/categories'
import { paths } from '@/app/router/paths'
import styles from './CategoryChips.module.scss'

/** Phone-width category switcher. Switching category keeps the search and filters but returns to page 1. */
export default function CategoryChips({ activeSlug, className }) {
  const [searchParams] = useSearchParams()
  const next = new URLSearchParams(searchParams)
  next.delete('page')
  const search = next.toString() ? `?${next}` : ''

  const items = [{ slug: null, label: 'All', to: paths.shop }, ...CATEGORIES.map((category) => ({ ...category, to: paths.category(category.slug) }))]

  return (
    <nav aria-label="Shop by category" className={className}>
      <ul className={styles.list}>
        {items.map((item) => {
          const isActive = (activeSlug ?? null) === item.slug
          return (
            <li key={item.label}>
              <Link
                to={{ pathname: item.to, search }}
                className={clsx(styles.chip, isActive && styles.active)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
