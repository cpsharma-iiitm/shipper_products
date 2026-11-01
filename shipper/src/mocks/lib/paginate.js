// Helpers shared by the mock list endpoints (the real backend owns paging, sorting and filtering).

/** paginate(list, { page: '2', pageSize: '6' }) → { items, page, pageSize, totalItems, pageCount } */
export function paginate(list, { page = 1, pageSize = 10 } = {}) {
  const size = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 10))
  const totalItems = list.length
  const pageCount = Math.max(1, Math.ceil(totalItems / size))
  const current = Math.min(pageCount, Math.max(1, Number.parseInt(page, 10) || 1))
  return { items: list.slice((current - 1) * size, current * size), page: current, pageSize: size, totalItems, pageCount }
}

/** Query-string flags arrive as strings: 'true', '1', 'on' → true. */
export const toFlag = (value) => ['true', '1', 'on', 'yes'].includes(String(value).toLowerCase())

/** Case-insensitive "contains" match across several text fields. */
export const matchesText = (text, ...fields) => {
  const needle = String(text ?? '').trim().toLowerCase()
  return needle === '' || fields.some((field) => String(field ?? '').toLowerCase().includes(needle))
}

/** Sorts a copy of `list` by `key` ('field' ascending, '-field' descending). */
export function sortBy(list, key, accessors = {}) {
  if (!key) return [...list]
  const descending = key.startsWith('-')
  const field = descending ? key.slice(1) : key
  const read = accessors[field] ?? ((item) => item[field])
  return [...list].sort((a, b) => {
    const left = read(a)
    const right = read(b)
    const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left ?? '').localeCompare(String(right ?? ''))
    return descending ? -result : result
  })
}
