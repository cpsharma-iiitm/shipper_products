import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Checkbox from '@/components/atoms/Checkbox'
import Icon from '@/components/atoms/Icon'
import { pluralize } from '@/lib/format'
import FlatTable from '@/features/store-operations/components/FlatTable'
import styles from './PickList.module.scss'

const hasStock = (line) => line.available >= line.quantity

function PickStatus({ order, pickedUnits, allPicked }) {
  const shortLines = order.lines.filter((line) => !hasStock(line))

  if (order.onHold && order.delay) return <p className={clsx(styles.status, styles.warning)}>On hold. {order.delay.detail}</p>
  if (shortLines.length > 0) {
    const [line] = shortLines
    return (
      <p className={clsx(styles.status, styles.danger)}>
        Stock is short for {line.productCode}: requested {line.quantity}, available {line.available}. Report a discrepancy to hold the order.
      </p>
    )
  }
  if (allPicked) {
    return (
      <p className={clsx(styles.status, styles.success)}>
        <Icon name="check2" /> Stock matched. All {pluralize(order.summary.units, 'unit')} picked and reserved.
      </p>
    )
  }
  return <p className={styles.status}>{pickedUnits} of {pluralize(order.summary.units, 'unit')} picked.</p>
}

/**
 * Pick list of the order being worked: where each product is, how many are needed and what is on the
 * shelf. Lines are ticked as they are picked; a line the warehouse cannot cover is flagged instead.
 */
export default function PickList({ order, pickedCodes, onPickedChange, onScan }) {
  const pickable = order.lines.filter(hasStock)
  const allPicked = order.lines.length > 0 && pickable.length === order.lines.length && pickable.every((line) => pickedCodes.has(line.productCode))
  const pickedUnits = order.lines.filter((line) => pickedCodes.has(line.productCode)).reduce((total, line) => total + line.quantity, 0)

  const toggleLine = (code) => {
    const next = new Set(pickedCodes)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    onPickedChange(next)
  }

  const toggleAll = () => onPickedChange(allPicked ? [] : pickable.map((line) => line.productCode))

  const columns = [
    {
      key: 'pick',
      header: <span className="visually-hidden">Picked</span>,
      width: '1%',
      cell: (line) => (
        <Checkbox
          aria-label={`Mark ${line.productCode} as picked`}
          checked={pickedCodes.has(line.productCode)}
          disabled={!hasStock(line)}
          onChange={() => toggleLine(line.productCode)}
        />
      ),
    },
    { key: 'product', header: 'SKU / product', cell: (line) => `${line.productCode} · ${line.name}` },
    { key: 'bin', header: 'Bin', cell: (line) => line.bin },
    { key: 'requested', header: 'Requested', cell: (line) => line.quantity },
    { key: 'available', header: 'Available', cell: (line) => <span className={hasStock(line) ? undefined : styles.short}>{line.available}</span> },
    {
      key: 'picked',
      header: 'Picked',
      cell: (line) =>
        pickedCodes.has(line.productCode) ? (
          <span>
            {line.quantity} <Icon name="check2" label="Picked" />
          </span>
        ) : (
          <span className={styles.muted}>0</span>
        ),
    },
  ]

  return (
    <Card title={`Pick list · #${order.orderNumber}`} padding="sm">
      <p className={styles.meta}>
        {order.customer.name} · {pluralize(order.summary.units, 'unit')} · Payment {order.payment.status === 'paid' ? 'verified' : order.payment.status}
      </p>
      <div className={styles.controls}>
        <Checkbox
          className={clsx(styles.selection, pickedCodes.size > 0 && styles.active)}
          label={allPicked ? `All ${order.lines.length} products selected` : `${pickedCodes.size} of ${order.lines.length} products selected`}
          checked={allPicked}
          indeterminate={pickedCodes.size > 0 && !allPicked}
          disabled={pickable.length === 0}
          onChange={toggleAll}
        />
        <Button variant="secondary" size="sm" leftIcon="upc-scan" onClick={onScan}>
          Scan product
        </Button>
      </div>
      <FlatTable className={styles.table} caption={`Pick list for ${order.orderNumber}`} columns={columns} rows={order.lines} getRowId={(line) => line.productCode} />
      <PickStatus order={order} pickedUnits={pickedUnits} allPicked={allPicked} />
    </Card>
  )
}
