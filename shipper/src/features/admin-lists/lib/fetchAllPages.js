/**
 * Collects every page of a paged list response ({ items, pageCount }) so an export covers all rows that match
 * the current filters, not just the page on screen. `fetchPage(page)` requests one page.
 */
export async function fetchAllPages(fetchPage) {
  const first = await fetchPage(1)
  const items = [...first.items]
  for (let page = 2; page <= first.pageCount; page += 1) {
    const next = await fetchPage(page)
    items.push(...next.items)
  }
  return items
}
 
/** The largest page the list endpoints serve (ASSUMPTION — confirm with backend team). */
export const EXPORT_PAGE_SIZE = 100