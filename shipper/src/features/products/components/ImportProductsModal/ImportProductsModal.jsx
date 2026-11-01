import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Alert from '@/components/molecules/Alert'
import DataTable from '@/components/organisms/DataTable'
import Modal from '@/components/organisms/Modal'
import { useImportProducts } from '@/features/products/hooks/useProducts'
import { findMissingColumns, parseImportRows, PRODUCT_SHEET_COLUMNS, TEMPLATE_ROW } from '@/features/products/utils/productSheet'
import { exportToExcel, readExcelRows } from '@/lib/excel'
import { formatINR, pluralize } from '@/lib/format'
import styles from './ImportProductsModal.module.scss'

const MAX_PREVIEW_ROWS = 50

const PREVIEW_COLUMNS = [
  { key: 'rowNumber', header: 'Row', width: '3.5rem' },
  { key: 'code', header: 'Code', cell: ({ values }) => values.code },
  { key: 'name', header: 'Product name', cell: ({ values }) => values.name },
  { key: 'category', header: 'Category', cell: ({ values }) => values.category },
  { key: 'stock', header: 'Stock', cell: ({ values }) => values.stock },
  { key: 'mrp', header: 'MRP', cell: ({ values }) => (typeof values.mrp === 'number' ? formatINR(values.mrp) : values.mrp) },
  {
    key: 'check',
    header: 'Check',
    cell: ({ errors }) =>
      errors.length === 0 ? <Badge tone="success">Ready</Badge> : <span className={styles.problem}>{errors.join('. ')}</span>,
  },
]

/**
 * Import products from an .xlsx file. The sheet is read in the browser, checked for shape (required
 * columns and values) and previewed; only the rows that pass are sent. The backend validates every row
 * again and reports which it created, updated or rejected. Mount it only while open.
 */
export default function ImportProductsModal({ onClose }) {
  const inputRef = useRef(null)
  const [sheet, setSheet] = useState(null)
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState(null)
  const [result, setResult] = useState(null)
  const importProducts = useImportProducts()

  const readyRows = sheet?.rows.filter((row) => row.errors.length === 0) ?? []
  const problemCount = (sheet?.rows.length ?? 0) - readyRows.length

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setReadError(null)
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setReadError('Choose an Excel (.xlsx) file.')
      return
    }
    setReading(true)
    try {
      const { headers, rows } = await readExcelRows(file)
      const missing = findMissingColumns(headers)
      if (missing.length > 0) setReadError(`The sheet is missing these columns: ${missing.join(', ')}.`)
      else if (rows.length === 0) setReadError('The sheet has no product rows.')
      else setSheet({ fileName: file.name, rows: parseImportRows(rows) })
    } catch {
      setReadError('This file could not be read. Check that it is a valid .xlsx workbook.')
    } finally {
      setReading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      await exportToExcel({ fileName: 'shipper-products-import-template', sheetName: 'Products', columns: PRODUCT_SHEET_COLUMNS, rows: [TEMPLATE_ROW] })
    } catch {
      toast.error('The template could not be downloaded. Please try again.')
    }
  }

  const submit = () => {
    importProducts.mutate(
      readyRows.map(({ rowNumber, values }) => ({ rowNumber, ...values })),
      {
        onSuccess: setResult,
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const footer = result ? (
    <Button onClick={onClose}>Done</Button>
  ) : (
    <>
      {sheet && (
        <Button variant="secondary" className={styles.chooseAnother} disabled={importProducts.isPending} onClick={() => setSheet(null)}>
          Choose another file
        </Button>
      )}
      <Button variant="secondary" disabled={importProducts.isPending} onClick={onClose}>
        Cancel
      </Button>
      <Button loading={importProducts.isPending} disabled={readyRows.length === 0} onClick={submit}>
        Import {pluralize(readyRows.length, 'row')}
      </Button>
    </>
  )

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Import Excel"
      description="Add or update products from a spreadsheet. Rows with an existing product code update that product."
      closeOnBackdrop={!importProducts.isPending}
      footer={footer}
    >
      {result && (
        <div className={styles.result}>
          <Alert tone={result.rejected.length === 0 ? 'success' : 'warning'} title="Import finished">
            {pluralize(result.created, 'product')} added, {pluralize(result.updated, 'product')} updated
            {result.rejected.length > 0 && `, ${pluralize(result.rejected.length, 'row')} rejected by the server`}.
          </Alert>
          {result.rejected.length > 0 && (
            <ul className={styles.rejected} aria-label="Rejected rows">
              {result.rejected.map((row) => (
                <li key={row.rowNumber}>
                  <strong>Row {row.rowNumber}</strong>
                  {row.code && ` · ${row.code}`}: {row.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!result && !sheet && (
        <div className={styles.choose}>
          <Icon name="file-earmark-spreadsheet" className={styles.icon} />
          <p className={styles.lead}>Choose an .xlsx file with one product per row.</p>
          <p className={styles.help}>
            Use the template for the expected columns. Format the HSN and Code columns as text to keep leading zeros. The server checks every row
            again before anything changes.
          </p>
          <div className={styles.actions}>
            <Button leftIcon="upload" loading={reading} onClick={() => inputRef.current?.click()}>
              Choose file
            </Button>
            <Button variant="secondary" leftIcon="download" onClick={downloadTemplate}>
              Download template
            </Button>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx" className="visually-hidden" tabIndex={-1} aria-hidden="true" onChange={handleFile} />
          {readError && (
            <Alert tone="danger" className={styles.readError}>
              {readError}
            </Alert>
          )}
        </div>
      )}

      {!result && sheet && (
        <div className={styles.preview}>
          <p className={styles.fileSummary}>
            <strong>{sheet.fileName}</strong> · {pluralize(readyRows.length, 'row')} ready
            {problemCount > 0 && `, ${pluralize(problemCount, 'row')} with problems (these will be skipped)`}
          </p>
          <DataTable
            caption="Rows found in the spreadsheet"
            columns={PREVIEW_COLUMNS}
            rows={sheet.rows.slice(0, MAX_PREVIEW_ROWS)}
            getRowId={(row) => row.rowNumber}
            maxHeight="18rem"
            minWidth="640px"
          />
          {sheet.rows.length > MAX_PREVIEW_ROWS && (
            <p className={styles.help}>Showing the first {MAX_PREVIEW_ROWS} of {sheet.rows.length} rows.</p>
          )}
        </div>
      )}
    </Modal>
  )
}
