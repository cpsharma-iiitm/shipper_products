import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import AddressSummary from '@/components/molecules/AddressSummary'
import { formatINR } from '@/lib/format'
import { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import styles from './FinalVerification.module.scss'

function paymentNote({ method, paid, walletApplied }) {
  const parts = [`${method} ${formatINR(paid)}`]
  if (walletApplied > 0) parts.push(`Wallet ${formatINR(walletApplied)}`)
  return `${parts.join(' + ')}${method === 'COD' ? '' : ' · No COD collection'}`
}

/** Last look at what was paid and where the parcel is going before it is sealed. */
export default function FinalVerification({ order }) {
  const { payment, address } = order

  return (
    <Card title="Final verification" padding="sm">
      <PanelSection>
        <div className={styles.row}>
          <p className={styles.heading}>Payment · {formatINR(payment.gross)} gross</p>
          {payment.status === 'paid' ? <Badge tone="success">Verified</Badge> : <StatusBadge status={payment.status} />}
        </div>
        <PanelNote>{paymentNote(payment)}</PanelNote>
      </PanelSection>
      <PanelSection divided>
        <div className={styles.row}>
          <p className={styles.heading}>{address.label ?? 'Delivery address'}</p>
          {address.verified && <Badge tone="success">Verified</Badge>}
        </div>
        <AddressSummary address={{ ...address, name: address.name ?? order.customer.name }} />
        {address.verified ? (
          <Badge tone="success" className="align-self-start">
            Address verified · {address.pin}
          </Badge>
        ) : (
          <Badge tone="warning" className="align-self-start">
            Address not verified · {address.pin}
          </Badge>
        )}
      </PanelSection>
    </Card>
  )
}
