import Checkbox from '@/components/atoms/Checkbox'
import Icon from '@/components/atoms/Icon'
import { pluralize } from '@/lib/format'
import FlatTable from '@/features/store-operations/components/FlatTable'
import styles from './PackChecklist.module.scss'

/**
 * Contents of the order, ticked off as each product is checked against the parcel. "Condition" is what
 * the packer looks for on that product.
 */
export default function PackChecklist({ order, checked, onToggleLine, showError }) {
  const checkedUnits = order.lines.filter((line) => checked.includes(line.productCode)).reduce((total, line) => total + line.quantity, 0)
  const allChecked = checkedUnits === order.summary.units

  const columns = [
    {
      key: 'check',
      header: 'Check',
      width: '1%',
      cell: (line) => <Checkbox aria-label={`Check ${line.productCode}`} checked={checked.includes(line.productCode)} onChange={() => onToggleLine(line.productCode)} />,
    },
    { key: 'product', header: 'Product / batch', cell: (line) => `${line.productCode} · ${line.name} / ${line.batch}` },
    { key: 'quantity', header: 'Qty', cell: (line) => line.quantity },
    {
      key: 'condition',
      header: 'Condition',
      cell: (line) => (
        <span>
          <Icon name="check2" /> {line.inspection}
        </span>
      ),
    },
  ]

  return (
    <>
      <FlatTable className={styles.table} caption={`Contents of ${order.orderNumber}`} columns={columns} rows={order.lines} getRowId={(line) => line.productCode} />
      {allChecked ? (
        <p className={styles.success}>
          <Icon name="check2" /> {checkedUnits} of {pluralize(order.summary.units, 'unit')} checked · Correct batches confirmed
        </p>
      ) : (
        <p className={styles.summary}>
          {checkedUnits} of {pluralize(order.summary.units, 'unit')} checked
        </p>
      )}
      {showError && (
        <p role="alert" className={styles.error}>
          Check every product against the parcel before marking the order packed.
        </p>
      )}
    </>
  )
}
