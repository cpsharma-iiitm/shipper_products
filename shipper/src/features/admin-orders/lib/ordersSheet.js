import { statusLabel } from '@/features/admin-orders/constants/orderOptions'

const COLUMNS = [
  { header: 'Order', key: 'orderNumber', width: 12 },
  { header: 'Placed', key: 'placedAt', format: 'date', width: 14 },
  { header: 'Customer code', key: 'customerCode', width: 14 },
  { header: 'Customer', key: 'customerName', width: 22 },
  { header: 'Mobile', key: 'customerMobile', format: 'text', width: 14 },
  { header: 'Units', key: 'units', format: 'number', width: 8 },
  { header: 'Gross amount', key: 'grossAmount', format: 'inr', width: 15 },
  { header: 'Wallet applied', key: 'walletApplied', format: 'inr', width: 15 },
  { header: 'Paid via gateway', key: 'payable', format: 'inr', width: 16 },
  { header: 'Payment status', key: 'paymentStatus', width: 16 },
  { header: 'Payment method', key: 'paymentMethod', width: 16 },
  { header: 'Status', key: 'status', width: 18 },
]

/** Excel sheet definition for the order list (every order matching the filters, not only the page on screen). */
export const ordersSheet = { fileName: 'Shipper-orders', sheetName: 'Orders', title: 'Orders', columns: COLUMNS }

export const ordersSheetRows = (rows) =>
  rows.map((row) => ({ ...row, status: statusLabel(row.status), paymentStatus: statusLabel(row.paymentStatus) }))
