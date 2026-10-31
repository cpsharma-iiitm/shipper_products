import clsx from 'clsx'
import styles from './StatGrid.module.scss'
 
/**
 * Responsive row of StatCards: one column on phones, two from 576px, then `columns` (4 by default, or 3)
 * from 1280px.
 */
export default function StatGrid({ columns = 4, className, children }) {
  return <div className={clsx(styles.grid, columns === 3 && styles.three, className)}>{children}</div>
}