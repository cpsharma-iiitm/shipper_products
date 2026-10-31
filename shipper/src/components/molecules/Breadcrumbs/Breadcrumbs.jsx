import { Link } from 'react-router-dom'
import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Breadcrumbs.module.scss'
/**
* Trail of locations; the last item is the current page and is not a link.
* <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Haldi', to: '/c/haldi' }, { label: 'Haldi Powder 500g' }]} />
*/
export default function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className={clsx(styles.item, isCurrent && styles.current)}>
              {isCurrent || !item.to ? (
                <span aria-current={isCurrent ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              )}
              {!isCurrent && <Icon name="chevron-right" className={styles.separator} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}