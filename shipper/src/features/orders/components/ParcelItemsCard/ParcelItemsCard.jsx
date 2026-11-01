import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Card from '@/components/atoms/Card'
import Thumbnail from '@/components/atoms/Thumbnail'
import { formatINR } from '@/lib/format'
import styles from './ParcelItemsCard.module.scss'

/** "Inside your parcel": each line with its picture, pack size, product code, quantity and line total. */
export default function ParcelItemsCard({ lines, className }) {
  return (
    <Card title="Inside your parcel" padding="md" className={className}>
      <ul className={styles.lines}>
        {lines.map((line) => (
          <li key={line.productCode} className={styles.line}>
            <Thumbnail src={line.image} size={76} />
            <div className={styles.info}>
              {line.slug ? (
                <Link to={paths.product(line.slug)} className={styles.name}>
                  {line.name}
                </Link>
              ) : (
                <p className={styles.name}>{line.name}</p>
              )}
              <p className={styles.meta}>
                {line.unit} · {line.productCode} · Qty {line.quantity}
              </p>
            </div>
            <p className={styles.total}>{formatINR(line.lineTotal)}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
