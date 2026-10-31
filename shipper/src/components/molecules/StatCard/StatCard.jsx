import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './StatCard.module.scss'

/**
 * KPI tile. `value` and `delta` arrive already formatted (formatINR, formatNumber, …) and come
 * from the backend; nothing is derived here.
 *
 * layout: stacked (dashboard: label / value / delta) | inline (filter cards: label left, number right)
 * size: md (default) | lg (admin dashboard headline figures: 28px value, roomier rows)
 * Pass `onClick` to make the tile a toggle button (for example "Delayed orders" filters); `selected`
 * then shows the tinted state.
 * deltaTone: success | danger | neutral
 */
export default function StatCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  hint,
  icon,
  layout = 'stacked',
  size = 'md',
  selected = false,
  onClick,
  className,
}) {
  const Component = onClick ? 'button' : 'div'
  const interactiveProps = onClick ? { type: 'button', onClick, 'aria-pressed': selected } : {}

  return (
    <Component
      className={clsx(styles.card, styles[layout], size === 'lg' && styles.sizeLg, onClick && styles.interactive, selected && styles.selected, className)}
      {...interactiveProps}
    >
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} />
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {delta && <span className={clsx(styles.delta, styles[deltaTone])}>{delta}</span>}
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </Component>
  )
}