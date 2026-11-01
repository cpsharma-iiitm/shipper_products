import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import { formatDate } from '@/lib/date'
import { formatINR } from '@/lib/format'
import { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useDocumentDownloads } from '@/features/store-operations/hooks/useDocumentDownloads'
import styles from './InvoicePanel.module.scss'

/** Preview of the tax invoice that goes into the parcel, with buttons for the invoice and the shipping label. */
export default function InvoicePanel({ order }) {
  const { invoice } = order
  const documents = useDocumentDownloads()
  const print = (kind) => documents.mutate({ kind, orderNumbers: [order.orderNumber] })

  return (
    <Card title="Invoice & shipping label" padding="sm">
      <PanelSection>
        <div className={styles.preview}>
          <div className={styles.header}>
            <p className={styles.brand}>Shipper.com</p>
            <p className={styles.kind}>TAX INVOICE</p>
          </div>
          <p className={styles.number}>
            {invoice.number} · {formatDate(invoice.date)}
          </p>
          <dl className={styles.amounts}>
            <div>
              <dt>Taxable / GST</dt>
              <dd>
                {formatINR(invoice.taxable, { decimals: 2 })} / {formatINR(invoice.gst, { decimals: 2 })}
              </dd>
            </div>
            <div>
              <dt>Gross amount</dt>
              <dd>{formatINR(invoice.gross, { decimals: 2 })}</dd>
            </div>
          </dl>
          <p className={styles.gstin}>
            GSTIN {invoice.gstin} · State {invoice.stateCode}
          </p>
        </div>
        <div className={styles.buttons}>
          <Button variant="secondary" size="sm" loading={documents.isPending && documents.variables?.kind === 'invoice'} onClick={() => print('invoice')}>
            Print invoice
          </Button>
          <Button variant="secondary" size="sm" loading={documents.isPending && documents.variables?.kind === 'label'} onClick={() => print('label')}>
            Print label
          </Button>
        </div>
        <PanelNote>Carrier: India Post · Tracking will be assigned before dispatch.</PanelNote>
      </PanelSection>
    </Card>
  )
}
