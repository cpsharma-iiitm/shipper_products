import Card from '@/components/atoms/Card'
import Thumbnail from '@/components/atoms/Thumbnail'
import DataTable from '@/components/organisms/DataTable'
import { formatINR, formatNumber } from '@/lib/format'
import styles from './OrderItemsCard.module.scss'
 
const money = (key) => (line) => formatINR(line[key], { decimals: 2 })
 
const COLUMNS = [
  {
    key: 'name',
    header: 'Product',
    width: '30%',
    cell: (line) => (
      <span className={styles.product}>
        <Thumbnail src={line.image} size="sm" />
        <span className={styles.productText}>
          <span className={styles.productName}>{line.name}</span>
          <span className={styles.secondary}>
            {line.unit} · {line.productCode}
          </span>
        </span>
      </span>
    ),
  },
  { key: 'hsn', header: 'HSN' },
  { key: 'gstPercent', header: 'GST', cell: (line) => `${line.gstPercent}%` },
  { key: 'quantity', header: 'Qty', cell: (line) => formatNumber(line.quantity) },
  { key: 'unitPrice', header: 'Unit price', align: 'right', cell: money('unitPrice') },
  { key: 'taxable', header: 'Taxable', align: 'right', cell: money('taxable') },
  { key: 'gst', header: 'GST amount', align: 'right', cell: money('gst') },
  { key: 'lineTotal', header: 'Amount', align: 'right', cell: money('lineTotal') },
]
 
/** The lines of an order exactly as stored on the order (prices include GST). */
export default function OrderItemsCard({ lines }) {
  return (
    <Card title="Items" padding="md" radius="md">
      <DataTable caption="Items on this order" columns={COLUMNS} rows={lines} getRowId={(line) => line.productCode} minWidth="46rem" />
    </Card>
  )
}