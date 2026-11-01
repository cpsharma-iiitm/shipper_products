import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { PaginationBar } from '@/components/molecules/Pagination'
import { useWalletTransactions } from '@/features/wallet/hooks/useWallet'
import { formatDateTime } from '@/lib/date'
import { formatINR } from '@/lib/format'
import styles from './WalletTransactions.module.scss'

/** The wallet ledger, newest first: what moved the balance, when, the order it relates to and the amount. */
export default function WalletTransactions() {
  const [page, setPage] = useState(1)
  const ledger = useWalletTransactions({ page })

  let content
  if (ledger.isPending) {
    content = (
      <div className={styles.skeleton} aria-busy="true" aria-label="Loading wallet activity">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height="2.5rem" />
        ))}
      </div>
    )
  } else if (ledger.isError) {
    content = <ErrorState compact title="We couldn’t load your wallet activity" message={getErrorMessage(ledger.error)} onRetry={ledger.refetch} />
  } else if (ledger.data.items.length === 0) {
    content = <EmptyState compact icon="wallet2" title="No wallet activity yet" description="Refunds, cashback and wallet payments will appear here." />
  } else {
    content = (
      <>
        <ul className={styles.list}>
          {ledger.data.items.map((entry) => {
            const isCredit = entry.type === 'credit'
            return (
              <li key={entry.id} className={styles.entry}>
                <span className={clsx(styles.icon, isCredit ? styles.credit : styles.debit)}>
                  <Icon name={isCredit ? 'arrow-down-left' : 'arrow-up-right'} />
                </span>
                <div className={styles.text}>
                  <p className={styles.reason}>{entry.reason}</p>
                  <p className={styles.meta}>
                    {formatDateTime(entry.at)}
                    {entry.orderNumber && (
                      <>
                        {' · '}
                        <Link to={paths.order(entry.orderNumber)} className={styles.orderLink}>
                          Order #{entry.orderNumber}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <p className={clsx(styles.amount, isCredit && styles.creditAmount)}>
                  <span className="visually-hidden">{isCredit ? 'Credit of ' : 'Debit of '}</span>
                  {isCredit ? '+' : '−'}
                  {formatINR(entry.amount, { decimals: 2 })}
                </p>
              </li>
            )
          })}
        </ul>
        <PaginationBar
          className={styles.pagination}
          page={ledger.data.page}
          pageSize={ledger.data.pageSize}
          totalItems={ledger.data.totalItems}
          onPageChange={setPage}
          itemLabel="transactions"
        />
      </>
    )
  }

  return (
    <Card title="Wallet activity" padding="md">
      {content}
    </Card>
  )
}
