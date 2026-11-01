import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import { formatINR } from '@/lib/format'
import styles from './ReconciliationCards.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

/**
 * The two panels under the financial table: how one order's amounts reconcile, and the customer's wallet
 * for it. `data` is the reconciliation response; the backend states whether the order is balanced.
 */
export default function ReconciliationCards({ data, selected }) {
  const { reconciliation: r, wallet } = data
  return (
    <div className={styles.row}>
      <Card title={`${selected ? 'Selected order' : 'Order'} reconciliation · ${data.orderNumber}`} padding="sm" radius="md">
        <div className={styles.reconciliation}>
          <div className={styles.lines}>
            <p>
              Taxable {money(r.taxable)} + GST {money(r.gst)} + Shipping {money(r.shipping)}
            </p>
            <p>
              Gross {money(r.gross)} = Wallet {money(r.wallet)} + {r.gatewayLabel} {money(r.gateway)}
            </p>
          </div>
          <Badge tone={r.balanced ? 'success' : 'danger'}>{r.balanced ? 'Balanced' : 'Needs review'}</Badge>
        </div>
      </Card>
      <Card title={`Customer wallet · ${wallet.customerCode}`} padding="sm" radius="md">
        <div className={styles.wallet}>
          <p className={styles.walletLine}>
            Opening {formatINR(wallet.opening)} · Used {formatINR(wallet.used)}
          </p>
          <p className={styles.closing}>Closing {formatINR(wallet.closing)}</p>
        </div>
      </Card>
    </div>
  )
}
