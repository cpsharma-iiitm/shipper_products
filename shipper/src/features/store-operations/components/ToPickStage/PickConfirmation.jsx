import { toast } from 'react-toastify'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import SummaryRows from '@/components/molecules/SummaryRows'
import { getErrorMessage } from '@/app/services'
import { pluralize } from '@/lib/format'
import { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useMarkPicked } from '@/features/store-operations/hooks/useFulfilmentActions'
import styles from './PickConfirmation.module.scss'

/** Who is picking, from where, how far along they are, and the buttons that finish or flag the pick. */
export default function PickConfirmation({ order, pickedCodes, onPicked, onReportDiscrepancy }) {
  const markPicked = useMarkPicked()
  const pickedUnits = order.lines.filter((line) => pickedCodes.has(line.productCode)).reduce((total, line) => total + line.quantity, 0)
  const allPicked = order.lines.every((line) => pickedCodes.has(line.productCode))

  const finish = () =>
    markPicked.mutate(
      { orderNumber: order.orderNumber, lines: order.lines.map((line) => ({ productCode: line.productCode, pickedQuantity: pickedCodes.has(line.productCode) ? line.quantity : 0 })) },
      {
        onSuccess: () => {
          toast.success(`${order.orderNumber} picked and moved to To Pack.`)
          onPicked()
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )

  return (
    <Card title="Pick confirmation" padding="sm">
      <PanelSection>
        <SummaryRows
          rows={[
            { label: 'Assigned to', value: order.fulfilment.assignee },
            { label: 'Location', value: order.fulfilment.warehouse },
            { label: 'Pick batch', value: order.fulfilment.pickBatch ?? '—' },
            { label: 'Progress', value: `${pickedUnits} / ${pluralize(order.summary.units, 'unit')}` },
          ]}
        />
        {order.stock.allAvailable ? (
          <Badge tone="success" className="align-self-start">
            Stock verified
          </Badge>
        ) : (
          <Badge tone="danger" className="align-self-start">
            Stock short
          </Badge>
        )}
      </PanelSection>
      <PanelSection divided className={styles.actions}>
        <PanelNote>Check batch, expiry and product condition before handing over to packing.</PanelNote>
        <div className={styles.buttons}>
          <Button size="lg" rightIcon="arrow-right" disabled={!allPicked || order.onHold} loading={markPicked.isPending} onClick={finish}>
            Move to To Pack
          </Button>
          <Button variant="secondary" size="sm" onClick={onReportDiscrepancy} disabled={order.onHold}>
            Report discrepancy
          </Button>
        </div>
      </PanelSection>
    </Card>
  )
}
