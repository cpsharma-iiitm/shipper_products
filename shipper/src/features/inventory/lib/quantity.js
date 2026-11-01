/** An order quantity typed into the restock table: a whole number of at least 1, or null when it is not valid. */
export function parseQuantity(text) {
  return /^[1-9]\d{0,5}$/.test(String(text).trim()) ? Number(String(text).trim()) : null
}
