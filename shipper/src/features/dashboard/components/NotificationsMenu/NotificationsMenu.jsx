import { Link } from 'react-router-dom'
import Icon from '@/components/atoms/Icon'
import IconButton from '@/components/atoms/IconButton'
import Popover from '@/components/molecules/Popover'
import Skeleton from '@/components/atoms/Skeleton'
import { formatShortDateTime } from '@/lib/date'
import { useNotifications } from '@/features/dashboard/hooks/useNotifications'
import styles from './NotificationsMenu.module.scss'

const TYPE_ICON = { low_stock: 'exclamation-triangle', delayed_order: 'clock-history', new_order: 'bag-check' }

/** Bell with an unread count and a list of operational alerts (low stock, delayed and new orders). */
export default function NotificationsMenu() {
  const { data, isPending, isError } = useNotifications()
  const unread = data?.unreadCount ?? 0

  return (
    <div className={styles.wrapper}>
      <Popover
        align="end"
        panelClassName={styles.panel}
        trigger={({ props }) => (
          <IconButton icon="bell" label={unread ? `Notifications, ${unread} unread` : 'Notifications'} size="lg" {...props} />
        )}
      >
        {({ close }) => (
          <section aria-label="Notifications">
            <h2 className={styles.title}>Notifications</h2>
            {isPending && <Skeleton height="3rem" radius="8px" />}
            {isError && <p className={styles.empty}>Notifications could not be loaded.</p>}
            {data && data.items.length === 0 && <p className={styles.empty}>You’re all caught up.</p>}
            {data && (
              <ul>
                {data.items.map((item) => (
                  <li key={item.id}>
                    <Link to={item.href} className={styles.item} onClick={close}>
                      <span className={styles.icon}>
                        <Icon name={TYPE_ICON[item.type] ?? 'bell'} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <span className={styles.description}>{item.description}</span>
                        <span className={styles.time}>{formatShortDateTime(item.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </Popover>
      {unread > 0 && (
        <span className={styles.count} aria-hidden="true">
          {unread}
        </span>
      )}
    </div>
  )
}
