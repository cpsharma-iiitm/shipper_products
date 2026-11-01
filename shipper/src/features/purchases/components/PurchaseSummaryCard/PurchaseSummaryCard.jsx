import { useFormContext } from 'react-hook-form'
import Alert from '@/components/molecules/Alert'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Checkbox from '@/components/atoms/Checkbox'
import SummaryRows from '@/components/molecules/SummaryRows'
import { formatINR } from '@/lib/format'
import styles from './PurchaseSummaryCard.module.scss'

const money = (value) => formatINR(value, { decimals: 2 })

function taxRows(summary) {
  const split =
    summary.gstType === 'inter_state'
      ? [{ label: 'IGST', value: money(summary.igst) }]
      : [
          { label: 'CGST', value: money(summary.cgst) },
          { label: 'SGST', value: money(summary.sgst) },
        ]
  return [{ label: 'Taxable value', value: money(summary.taxableSubtotal) }, ...split, { label: 'Shipping', value: money(summary.shipping) }]
}

/**
 * Backend-calculated totals (taxable value, CGST/SGST or IGST, shipping, gross, wallet, amount to
 * collect) and the two ways to save the purchase. Nothing here is added up on the client.
 */
export default function PurchaseSummaryCard({ quote, collectLabel, pendingAction, canSubmit, serverError, onSave }) {
  const { register } = useFormContext()
  const summary = quote?.summary
  const wallet = quote?.wallet
  const busy = pendingAction !== null

  return (
    <Card title="Purchase summary" radius="md" padding="sm" className={styles.card}>
      {summary ? (
        <>
          <SummaryRows rows={taxRows(summary)} />
          <div className={styles.block}>
            <div className={styles.gross}>
              <span>Gross amount</span>
              <strong>{money(summary.grossAmount)}</strong>
            </div>
            <div className={styles.walletRow}>
              <Checkbox label="Apply wallet" disabled={!wallet.eligible || wallet.balance <= 0} {...register('useWallet')} />
              <span className={styles.walletAmount}>{money(wallet.applicable)}</span>
            </div>
            <p className={styles.walletNote}>
              Available {formatINR(wallet.balance)} · Closing balance {formatINR(wallet.balanceAfter)}
            </p>
          </div>
          <div className={styles.collect}>
            <span>{collectLabel}</span>
            <strong>{money(summary.payable)}</strong>
          </div>
        </>
      ) : (
        <p className={styles.placeholder}>Totals appear once a customer and at least one item are added.</p>
      )}

      {serverError && <Alert tone="danger">{serverError}</Alert>}

      <div className={styles.actions}>
        <Button size="lg" className={styles.primary} loading={pendingAction === 'submit'} disabled={busy || !canSubmit} onClick={() => onSave('submit')}>
          Create purchase
        </Button>
        <Button variant="secondary" size="sm" loading={pendingAction === 'draft'} disabled={busy} onClick={() => onSave('draft')}>
          Save draft
        </Button>
      </div>
    </Card>
  )
}
