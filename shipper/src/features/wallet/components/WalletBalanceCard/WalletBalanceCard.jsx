import { getErrorMessage } from '@/app/services'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import Alert from '@/components/molecules/Alert'
import ErrorState from '@/components/molecules/ErrorState'
import { useWallet } from '@/features/wallet/hooks/useWallet'
import { describeLastCredit } from '@/features/wallet/utils/lastCredit'
import { formatINR } from '@/lib/format'
import styles from './WalletBalanceCard.module.scss'

/**
 * The wallet page's balance card with the rules in force. The rules are information from the backend ("up to
 * ₹100 per order, not combinable with a coupon"); the checkout applies them, this screen only explains them.
 */
export default function WalletBalanceCard() {
  const wallet = useWallet()

  if (wallet.isPending) {
    return (
      <Card padding="lg" aria-busy="true" aria-label="Loading your wallet">
        <Skeleton width="8rem" height="0.875rem" />
        <Skeleton width="11rem" height="2.5rem" className={styles.skeletonAmount} />
      </Card>
    )
  }
  if (wallet.isError) return <ErrorState title="We couldn’t load your wallet" message={getErrorMessage(wallet.error)} onRetry={wallet.refetch} />

  const { balance, lastCredit, rules } = wallet.data
  return (
    <Card padding="lg" aria-label="Wallet balance">
      <div className={styles.balanceBlock}>
        <span className={styles.icon}>
          <Icon name="wallet2" />
        </span>
        <div>
          <p className={styles.label}>Available balance</p>
          <p className={styles.balance}>{formatINR(balance, { decimals: 2 })}</p>
          <p className={styles.lastCredit}>{describeLastCredit(lastCredit)}</p>
        </div>
      </div>
      <Alert tone="info" title="How your wallet works" className={styles.rules}>
        <ul className={styles.ruleList}>
          <li>
            Use your wallet balance at checkout to cover up to {formatINR(rules.maxPerOrder)} on each order.
          </li>
          {!rules.combinableWithCoupon && <li>A wallet can’t be combined with a coupon on the same order.</li>}
        </ul>
      </Alert>
    </Card>
  )
}
