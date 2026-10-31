import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Badge.module.scss'
/** Small label. tone: neutral | info | success | warning | danger. */
export default function Badge({ tone = 'neutral', size = 'md', shape = 'rounded', icon, className, children, ...rest }) {
  return (
    <span className={clsx(styles.badge, styles[tone], styles[size], shape === 'pill' && styles.pill, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  )
}