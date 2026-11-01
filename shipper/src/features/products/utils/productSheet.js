import { hsnSchema } from '@/lib/validation'

// One column set for the Excel export, the import template and the import parser, so an exported
// file can be edited and imported again.
export const PRODUCT_SHEET_COLUMNS = [
  { header: 'Code', key: 'code', width: 12, format: 'text', required: true },
  { header: 'Product name', key: 'name', width: 34, required: true },
  { header: 'Category', key: 'category', width: 16, required: true },
  { header: 'Unit', key: 'unit', width: 12, format: 'text', required: true },
  { header: 'Batch', key: 'batch', width: 12, format: 'text', required: true },
  { header: 'HSN', key: 'hsn', width: 12, format: 'text', required: true },
  { header: 'GST %', key: 'gstPercent', width: 9, format: 'number', required: true },
  { header: 'MRP', key: 'mrp', width: 12, format: 'inr', required: true },
  { header: 'Selling price', key: 'sellingPrice', width: 14, format: 'inr', required: true },
  { header: 'Stock', key: 'stock', width: 10, format: 'number', required: true },
  { header: 'PV', key: 'pv', width: 8, format: 'number', required: true },
  { header: 'Status', key: 'status', width: 10 },
  { header: 'Description', key: 'description', width: 40 },
]

/** Columns of the downloaded list: the importable ones plus the stock status the backend reports. */
export const EXPORT_COLUMNS = [...PRODUCT_SHEET_COLUMNS, { header: 'Stock status', key: 'stockStatus', width: 14 }]

const STATUS_LABELS = { active: 'Active', inactive: 'Inactive' }
const STOCK_STATUS_LABELS = { in_stock: 'In stock', low_stock: 'Low stock', out_of_stock: 'Out of stock' }

export function toExportRow(product) {
  return {
    code: product.code,
    name: product.name,
    category: product.categoryLabel,
    unit: product.unit,
    batch: product.batch,
    hsn: product.hsn,
    gstPercent: product.gstPercent,
    mrp: product.mrp,
    sellingPrice: product.sellingPrice,
    stock: product.stock,
    pv: product.pv,
    status: STATUS_LABELS[product.status] ?? product.status,
    description: product.description,
    stockStatus: STOCK_STATUS_LABELS[product.stockStatus] ?? product.stockStatus,
  }
}

export const TEMPLATE_ROW = {
  code: 'HL999',
  name: 'Sample Haldi Powder',
  category: 'Haldi',
  unit: '200 g',
  batch: 'HL1026',
  hsn: '091030',
  gstPercent: 5,
  mrp: 150,
  sellingPrice: 120,
  stock: 100,
  pv: 12,
  status: 'Active',
  description: 'Replace this sample row with your products.',
}

const normalizeHeader = (header) => String(header).toLowerCase().replace(/[^a-z0-9]/g, '')
const HEADER_LOOKUP = Object.fromEntries(PRODUCT_SHEET_COLUMNS.map((column) => [normalizeHeader(column.header), column.key]))
HEADER_LOOKUP.gst = 'gstPercent'

const NUMBER_FIELDS = [
  { key: 'gstPercent', label: 'GST %', integer: false },
  { key: 'mrp', label: 'MRP', integer: false },
  { key: 'sellingPrice', label: 'Selling price', integer: false },
  { key: 'stock', label: 'Stock', integer: true },
  { key: 'pv', label: 'PV', integer: true },
]

/** Header texts of required columns that the sheet does not have (by normalised name). */
export function findMissingColumns(headers) {
  const present = new Set(headers.map((header) => HEADER_LOOKUP[normalizeHeader(header)]).filter(Boolean))
  return PRODUCT_SHEET_COLUMNS.filter((column) => column.required && !present.has(column.key)).map((column) => column.header)
}

/**
 * Turns rows read from the sheet into import rows and checks their shape (required text, 6/8-digit
 * HSN, numbers). The backend validates again and has the final say (known categories, GST rates, prices).
 * Returns [{ rowNumber, values, errors: string[] }] where rowNumber is the row in the sheet.
 */
export function parseImportRows(rows) {
  return rows.map((raw, index) => {
    const values = {}
    Object.entries(raw).forEach(([header, value]) => {
      const key = HEADER_LOOKUP[normalizeHeader(header)]
      if (key) values[key] = typeof value === 'string' ? value.trim() : value
    })

    const errors = []
    PRODUCT_SHEET_COLUMNS.filter((column) => column.required && !NUMBER_FIELDS.some((field) => field.key === column.key)).forEach((column) => {
      if (String(values[column.key] ?? '').trim() === '') errors.push(`${column.header} is required`)
    })
    if (values.hsn !== undefined && String(values.hsn).trim() !== '' && !hsnSchema.safeParse(String(values.hsn)).success) {
      errors.push('HSN must contain 6 or 8 digits (format the column as text to keep leading zeros)')
    }
    NUMBER_FIELDS.forEach(({ key, label, integer }) => {
      const text = String(values[key] ?? '').trim()
      if (text === '') {
        errors.push(`${label} is required`)
        return
      }
      const number = Number(text)
      if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
        errors.push(`${label} must be ${integer ? 'a whole number' : 'a number'}, 0 or more`)
      } else {
        values[key] = number
      }
    })
    if (values.hsn !== undefined) values.hsn = String(values.hsn).trim()

    return { rowNumber: index + 2, values, errors }
  })
}
