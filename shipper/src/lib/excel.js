import { saveBlob } from './download'

// Real .xlsx files via exceljs (approved dependency). The library is large and only needed when
// someone exports or imports a sheet, so it is loaded on demand.
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const NUMBER_FORMATS = { inr: '"₹"#,##0.00', number: '#,##0', percent: '0.0"%"', text: '@', date: 'dd mmm yyyy' }

async function loadExcelJs() {
  const module = await import('exceljs')
  return module.default ?? module
}

/**
 * Builds a one-sheet workbook and downloads it.
 *   columns: [{ header: 'Order', key: 'orderNumber', width?: 14, format?: 'inr' | 'number' | 'percent' | 'date' | 'text' }]
 *   rows:    array of objects keyed by `key` (dates may be ISO strings or Date objects)
 * Every figure is written exactly as supplied by the backend; nothing is recalculated here.
 */
export async function exportToExcel({ fileName, sheetName = 'Sheet1', title, columns, rows }) {
  const ExcelJS = await loadExcelJs()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Shipper.com'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31))

  if (title) {
    sheet.addRow([title]).font = { bold: true, size: 14 }
    sheet.addRow([])
  }
  const headerRow = sheet.addRow(columns.map((column) => column.header))
  headerRow.font = { bold: true }
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FB' } }
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFE3E9F1' } } }
  })

  rows.forEach((row) => {
    sheet.addRow(
      columns.map((column) => {
        const value = row[column.key]
        return column.format === 'date' && typeof value === 'string' ? new Date(value) : (value ?? '')
      }),
    )
  })

  columns.forEach((column, index) => {
    const target = sheet.getColumn(index + 1)
    target.width = column.width ?? Math.max(12, String(column.header).length + 4)
    if (column.format && NUMBER_FORMATS[column.format]) target.numFmt = NUMBER_FORMATS[column.format]
  })
  headerRow.eachCell((cell) => {
    cell.numFmt = '@'
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveBlob(new Blob([buffer], { type: XLSX_MIME }), fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`)
}

/**
 * Reads the first sheet of an .xlsx File chosen by the user.
 * Returns { headers: string[], rows: object[] } with each row keyed by its header text.
 */
export async function readExcelRows(file) {
  const ExcelJS = await loadExcelJs()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.worksheets[0]
  if (!sheet) return { headers: [], rows: [] }

  const cellText = (cell) => {
    const value = cell.value
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return value.text ?? value.result ?? (value instanceof Date ? value.toISOString() : String(value))
    return value
  }
  const headers = []
  sheet.getRow(1).eachCell((cell, column) => {
    headers[column - 1] = String(cellText(cell)).trim()
  })
  const rows = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const entry = {}
    headers.forEach((header, index) => {
      if (header) entry[header] = cellText(row.getCell(index + 1))
    })
    if (Object.values(entry).some((value) => value !== '')) rows.push(entry)
  })
  return { headers: headers.filter(Boolean), rows }
}
