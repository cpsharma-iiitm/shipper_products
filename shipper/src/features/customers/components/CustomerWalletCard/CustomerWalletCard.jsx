import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import EmptyState from '@/components/molecules/EmptyState'
import DataTable from '@/components/organisms/DataTable'
import { formatDateTime } from '@/lib/date'
import { formatINR } from '@/lib/format'
import styles from './CustomerWalletCard.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

const COLUMNS = [
  { key: 'at', header: 'Date', cell: (row) => formatDateTime(row.at) },
  {
    key: 'reason',
    header: 'Description',
    cell: (row) =>
      row.reference ? (
        <Link to={paths.admin.order(row.reference)} className={styles.orderLink}>
          {row.reason}
        </Link>
      ) : (
        row.reason
      ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    cell: (row) => (
      <span className={clsx(styles.amount, row.type === 'credit' ? styles.credit : styles.debit)}>
        {row.type === 'credit' ? '+' : '−'}
        {money(row.amount)}
      </span>
    ),
  },
  { key: 'balanceAfter', header: 'Balance', align: 'right', cell: (row) => money(row.balanceAfter) },
]

/** Wallet ledger, newest first. Amounts and the running balance come from the backend. */
export default function CustomerWalletCard({ transactions }) {
  return (
    <Card title="Wallet ledger" padding="md" radius="md">
      <DataTable
        caption="Wallet ledger"
        columns={COLUMNS}
        rows={transactions}
        getRowId={(row) => row.id}
        emptyState={<EmptyState compact icon="wallet2" title="No wallet activity" description="Credits and payments from the wallet will be listed here." />}
        minWidth="38rem"
      />
    </Card>
  )
}
