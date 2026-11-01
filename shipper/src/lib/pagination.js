const range = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index)

/**
 * Page numbers with ellipses, always the same number of slots so the control does not jump:
 * getPageRange(5, 10) -> [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]
 */
export function getPageRange(page, pageCount, siblingCount = 1) {
  const totalSlots = siblingCount * 2 + 5
  if (pageCount <= totalSlots) return range(1, pageCount)

  const left = Math.max(page - siblingCount, 1)
  const right = Math.min(page + siblingCount, pageCount)
  const showLeftEllipsis = left > 2
  const showRightEllipsis = right < pageCount - 1
  const edgeCount = 3 + siblingCount * 2

  if (!showLeftEllipsis && showRightEllipsis) return [...range(1, edgeCount), 'ellipsis-end', pageCount]
  if (showLeftEllipsis && !showRightEllipsis) return [1, 'ellipsis-start', ...range(pageCount - edgeCount + 1, pageCount)]
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', pageCount]
}
