import { useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { formatNumber } from '@/lib/format'
import styles from './Tabs.module.scss'

/**
 * items: [{ key, label, count?, to? }]. variant: underline | pill (the Store Operation tab bar).
 *
 * Two behaviours, chosen by the items:
 *  - no `to`  → in-page tabs (role="tablist"). Pair each with <TabPanel id=… tabKey=… value=…>.
 *  - with `to` → route navigation rendered as links (aria-current="page"), for tabs that are URLs.
 */
export function TabPanel({ id, tabKey, value, children, className }) {
  if (tabKey !== value) return null
  return (
    <div role="tabpanel" id={`${id}-panel-${tabKey}`} aria-labelledby={`${id}-tab-${tabKey}`} tabIndex={0} className={className}>
      {children}
    </div>
  )
}

function TabLabel({ item }) {
  return (
    <>
      {item.label}
      {item.count !== undefined && item.count !== null && <span className={styles.count}>{formatNumber(item.count)}</span>}
    </>
  )
}

export default function Tabs({ items, value, onChange, id, variant = 'underline', label, className }) {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const listRef = useRef(null)
  const rootClass = clsx(styles.tabs, styles[variant], className)

  if (items.some((item) => item.to)) {
    return (
      <nav aria-label={label} className={rootClass}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.key}>
              <Link
                to={item.to}
                className={clsx(styles.tab, item.key === value && styles.active)}
                aria-current={item.key === value ? 'page' : undefined}
              >
                <TabLabel item={item} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  const handleKeyDown = (event) => {
    const currentIndex = Math.max(0, items.findIndex((item) => item.key === value))
    const nextIndexByKey = {
      ArrowRight: (currentIndex + 1) % items.length,
      ArrowLeft: (currentIndex - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }
    const nextIndex = nextIndexByKey[event.key]
    if (nextIndex === undefined) return

    event.preventDefault()
    onChange(items[nextIndex].key)
    listRef.current?.querySelectorAll('[role="tab"]')[nextIndex]?.focus()
  }

  return (
    <div className={rootClass}>
      <div ref={listRef} role="tablist" aria-label={label} className={styles.list} onKeyDown={handleKeyDown}>
        {items.map((item) => {
          const selected = item.key === value
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              className={clsx(styles.tab, selected && styles.active)}
              onClick={() => onChange(item.key)}
            >
              <TabLabel item={item} />
            </button>
          )
        })}
      </div>
    </div>
  )
}