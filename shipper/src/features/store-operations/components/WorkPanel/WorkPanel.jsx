import clsx from 'clsx'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { getErrorMessage } from '@/app/services'
import styles from './WorkPanel.module.scss'

/** A block inside a panel: optional heading, optional divider above, content spaced consistently. */
export function PanelSection({ title, divided = false, className, children }) {
  return (
    <div className={clsx(styles.section, divided && styles.divided, className)}>
      {title && <h3 className={styles.sectionTitle}>{title}</h3>}
      {children}
    </div>
  )
}

/** Small muted explanatory line used in panels. */
export function PanelNote({ tone, className, children }) {
  return <p className={clsx(styles.note, tone && styles[tone], className)}>{children}</p>
}

/**
 * Card for the right-hand work area. It owns the three states every panel shares: nothing selected,
 * loading and failed; `children` receives the loaded work order.
 *   query: the result of useWorkOrder(orderNumber)
 */
export default function WorkPanel({ title, orderNumber, query, emptyTitle, emptyDescription, children, className }) {
  let body
  if (!orderNumber) {
    body = <EmptyState compact icon="box-seam" title={emptyTitle} description={emptyDescription} />
  } else if (query.isError) {
    body = <ErrorState compact title="Couldn't load this order" message={getErrorMessage(query.error)} onRetry={query.refetch} />
  } else if (!query.data) {
    body = (
      <div className={styles.skeleton} role="status" aria-label="Loading order">
        <Skeleton height="1rem" width="55%" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="80%" />
        <Skeleton height="6rem" />
        <Skeleton height="2.75rem" width="60%" />
      </div>
    )
  } else {
    body = children(query.data)
  }

  return (
    <Card title={title} padding="sm" className={clsx(styles.panel, className)}>
      {body}
    </Card>
  )
}
