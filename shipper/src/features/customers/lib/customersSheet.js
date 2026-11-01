import { statusLabel } from '@/features/admin-orders/constants/orderOptions'

const COLUMNS = [
  { header: 'Customer code', key: 'code', width: 15 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Mobile', key: 'mobile', format: 'text', width: 14 },
  { header: 'City', key: 'city', width: 16 },
  { header: 'State', key: 'state', width: 18 },
  { header: 'Orders', key: 'ordersCount', format: 'number', width: 9 },
  { header: 'Total spend', key: 'totalSpend', format: 'inr', width: 15 },
  { header: 'Wallet balance', key: 'walletBalance', format: 'inr', width: 15 },
  { header: 'Status', key: 'status', width: 11 },
  { header: 'Joined', key: 'joinedAt', format: 'date', width: 14 },
]

/** Excel sheet definition for the customer list (every customer matching the filters, not only the page on screen). */
export const customersSheet = { fileName: 'Shipper-customers', sheetName: 'Customers', title: 'Customers', columns: COLUMNS }

export const customersSheetRows = (rows) => rows.map((row) => ({ ...row, status: statusLabel(row.status) }))
