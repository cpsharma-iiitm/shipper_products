import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import IconButton from '@/components/atoms/IconButton'
import styles from './Alert.module.scss'
const DEFAULT_ICONS = {
  info: 'info-circle-fill',
  success: 'check-circle-fill',
  warning: 'exclamation-triangle-fill',
  danger: 'exclamation-octagon-fill',
}
/**
* Inline banner. tone: info | success | warning | danger. Warning and danger are announced
* immediately (role="alert"); info and success politely (role="status").
*/
export default function Alert({ tone = 'info', title, icon, action, onDismiss, className, children }) {
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={clsx(styles.alert, styles[tone], className)}>
      <Icon name={icon ?? DEFAULT_ICONS[tone]} className={styles.icon} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.message}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
      {onDismiss && <IconButton icon="x-lg" label="Dismiss" size="sm" onClick={onDismiss} />}
    </div>
  )
}