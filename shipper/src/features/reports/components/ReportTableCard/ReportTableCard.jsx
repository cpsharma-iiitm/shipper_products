import { Link } from 'react-router-dom'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import DataTable from '@/components/organisms/DataTable'
import styles from './ReportTableCard.module.scss'

/** A titled card holding a small read-only table and a "view more" link (Reports overview). */
export default function ReportTableCard({ title, caption, columns, rows, getRowId, emptyState, linkLabel, linkTo, loading = false }) {
  return (
    <Card title={title} padding="sm" radius="md" className={styles.card}>
      <DataTable
        className={styles.table}
        caption={caption}
        columns={columns}
        rows={rows}
        getRowId={getRowId}
        loading={loading}
        loadingRows={3}
        emptyState={emptyState}
        minWidth="26rem"
      />
      <Link to={linkTo} className={styles.link}>
        {linkLabel}
        <Icon name="arrow-right" />
      </Link>
    </Card>
  )
}
