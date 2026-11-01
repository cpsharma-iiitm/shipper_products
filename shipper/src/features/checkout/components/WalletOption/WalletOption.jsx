import { useId } from 'react'
import Badge from '@/components/atoms/Badge'
import Checkbox from '@/components/atoms/Checkbox'
import Skeleton from '@/components/atoms/Skeleton'
import { formatINR } from '@/lib/format'
import styles from './WalletOption.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

/**
 * "Use wallet" toggle. Every amount comes from the quote's `wallet` block: what applies to this order
 * (`applied`), the balance, the balance afterwards and whether a coupon rules the wallet out (`eligible`).
 */
export default function WalletOption({ wallet, checked, onChange, compact }) {
  const hintId = useId()

  if (!wallet) {
    return (
      <div className={styles.loading}>
        <Skeleton width="55%" height="1.125rem" />
        <Skeleton width="70%" />
      </div>
    )
  }

  const empty = wallet.balance <= 0
  const unavailable = empty || !wallet.eligible
  const active = checked && !unavailable

  let hint
  if (empty) hint = 'Your wallet is empty. Rewards you earn will appear here.'
  else if (!wallet.eligible) hint = 'Wallet and coupon offers cannot be combined. Remove the coupon in your cart to use your wallet.'
  else if (active) hint = `Available ${money(wallet.balance)} · ${compact ? 'After this order' : 'Balance after order'} ${money(wallet.balanceAfter)}`
  else hint = `Available ${money(wallet.balance)} · Up to ${money(wallet.maxPerOrder)} per order`

  return (
    <div className={styles.option}>
      <div className={styles.row}>
        <Checkbox
          label={<strong>{active ? `Use ${money(wallet.applied)} from ${compact ? 'wallet' : 'your wallet'}` : 'Use wallet balance'}</strong>}
          checked={active}
          disabled={unavailable}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={hintId}
        />
        {active && !compact && <Badge tone="success">Applied</Badge>}
      </div>
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>
      {active && compact && (
        <Badge tone="success" className={styles.applied}>
          {money(wallet.applied)} applied
        </Badge>
      )}
    </div>
  )
}
