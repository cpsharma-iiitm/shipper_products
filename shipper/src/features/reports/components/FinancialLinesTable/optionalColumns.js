import { formatINR } from '@/lib/format'

const money = (key) => (row) => formatINR(row[key], { decimals: 2 })

/** Columns the "Columns" menu can add to the financial table (also written to every Excel export). */
export const OPTIONAL_COLUMNS = [
  { key: 'cgst', label: 'CGST', header: 'CGST', cell: money('cgst') },
  { key: 'sgst', label: 'SGST', header: 'SGST', cell: money('sgst') },
  { key: 'igst', label: 'IGST', header: 'IGST', cell: money('igst') },
  { key: 'shipping', label: 'Shipping', header: 'Shipping', cell: money('shipping') },
  { key: 'wallet', label: 'Wallet used', header: 'Wallet', cell: money('wallet') },
  { key: 'net', label: 'Net payable', header: 'Net payable', cell: money('net') },
]
