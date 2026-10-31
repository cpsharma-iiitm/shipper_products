import clsx from 'clsx'
import styles from './Skeleton.module.scss'
/** Placeholder block shown while content loads. Always decorative; the container announces loading. */
export default function Skeleton({ width = '100%', height = '1rem', radius, className, style }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}