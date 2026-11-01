import clsx from 'clsx'
import DataTable from '@/components/organisms/DataTable'
import styles from './FlatTable.module.scss'

/**
 * DataTable drawn flat inside a card, as on the Store Operation design: no outer frame, a tighter header
 * and column rhythm. Takes the same props as DataTable. When the table is selectable, "select all" is the
 * selection summary the card shows above it, so the header checkbox is not repeated.
 */
export default function FlatTable({ className, ...props }) {
  return <DataTable className={clsx(styles.flat, className)} minWidth="30rem" {...props} />
}
