import clsx from 'clsx'
import styles from './Spinner.module.scss'
/** Loading indicator. Use `decorative` when surrounding text already announces the busy state. */
export default function Spinner({ size = 'md', label = 'Loading', decorative = false, className }) {
  return (
    <span
      className={clsx(styles.spinner, styles[size], className)}
      {...(decorative ? { 'aria-hidden': true } : { role: 'status', 'aria-label': label })}
    />
  )
}