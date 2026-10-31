import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './EmptyState.module.scss'
/** "Nothing here yet" panel for empty lists, carts, search results. `action` is typically a Button. */
export default function EmptyState({ icon = 'inbox', title, description, action, compact = false, className }) {
  return (
    <div className={clsx(styles.state, compact && styles.compact, className)}>
      <span className={styles.icon}>
        <Icon name={icon} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}