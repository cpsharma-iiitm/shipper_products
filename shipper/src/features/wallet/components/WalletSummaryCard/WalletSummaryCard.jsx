import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import { useWallet } from '@/features/wallet/hooks/useWallet'
import { describeLastCredit } from '@/features/wallet/utils/lastCredit'
import { formatINR } from '@/lib/format'
import styles from './WalletSummaryCard.module.scss'

/** "Shipper wallet" on the profile page: the available balance, the last credit and a link to the wallet. */
export default function WalletSummaryCard() {
  const wallet = useWallet()

  return (
    <Card title="Shipper wallet" padding="md">
      {wallet.isPending && (
        <div className={styles.skeleton} aria-busy="true" aria-label="Loading your wallet">
          <Skeleton height="1.75rem" />
          <Skeleton width="45%" height="0.875rem" />
        </div>
      )}
      {wallet.isError && <ErrorState compact title="We couldn’t load your wallet" message={getErrorMessage(wallet.error)} onRetry={wallet.refetch} />}
      {wallet.data && (
        <>
          <div className={styles.balanceRow}>
            <p className={styles.label}>Available balance</p>
            <p className={styles.balance}>{formatINR(wallet.data.balance, { decimals: 2 })}</p>
          </div>
          <div className={styles.footer}>
            <p className={styles.lastCredit}>{describeLastCredit(wallet.data.lastCredit)}</p>
            <Link to={paths.wallet} className={styles.link}>
              View wallet &amp; rewards <Icon name="arrow-right" />
            </Link>
          </div>
        </>
      )}
    </Card>
  )
}
