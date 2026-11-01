import { statusLabel } from '@/features/admin-orders/constants/orderOptions'
import { formatDateRange } from '@/lib/date'

const COLUMNS = [
  { header: 'Order', key: 'orderNumber', width: 12 },
  { header: 'Order date', key: 'orderDate', format: 'date', width: 14 },
  { header: 'Customer code', key: 'customerCode', width: 14 },
  { header: 'Customer', key: 'customerName', width: 22 },
  { header: 'Product code', key: 'productCode', width: 13 },
  { header: 'Product', key: 'productName', width: 30 },
  { header: 'HSN', key: 'hsn', format: 'text', width: 10 },
  { header: 'GST %', key: 'gstPercent', format: 'number', width: 8 },
  { header: 'Qty', key: 'quantity', format: 'number', width: 7 },
  { header: 'Taxable value', key: 'taxable', format: 'inr', width: 15 },
  { header: 'CGST', key: 'cgst', format: 'inr', width: 12 },
  { header: 'SGST', key: 'sgst', format: 'inr', width: 12 },
  { header: 'IGST', key: 'igst', format: 'inr', width: 12 },
  { header: 'GST', key: 'gst', format: 'inr', width: 12 },
  { header: 'Shipping', key: 'shipping', format: 'inr', width: 12 },
  { header: 'Wallet used', key: 'wallet', format: 'inr', width: 13 },
  { header: 'Line total', key: 'lineTotal', format: 'inr', width: 14 },
  { header: 'Net payable', key: 'net', format: 'inr', width: 14 },
  { header: 'Status', key: 'status', width: 18 },
]

/**
 * Excel sheet definition for the financial report. The sheet always carries every column (GST split, shipping,
 * wallet, net) whichever columns the table currently shows; figures are written as the backend sent them.
 */
export function financialSheet(period) {
  return {
    fileName: `Shipper-financial-report-${period.from}-to-${period.to}`,
    sheetName: 'Financial report',
    title: `Customer & order financial report · ${formatDateRange(period.from, period.to)}`,
    columns: COLUMNS,
  }
}

/** Report lines as sheet rows (the status shown as its label, not its key). */
export const financialSheetRows = (rows) => rows.map((row) => ({ ...row, status: statusLabel(row.status) }))
