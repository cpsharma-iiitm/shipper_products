import { useState } from 'react'

/**
 * Checked rows of a queue and the order the side panel shows (the most recently checked one).
 * Until the user chooses, the first row is selected, as on the design (`selectFirst: false` starts empty,
 * for lists with no side panel). The selection is dropped when `resetKey` changes (new search or filter)
 * and after an action via `reset()`.
 */
export function useQueueSelection(rows, resetKey, { selectFirst = true } = {}) {
  const [state, setState] = useState({ key: resetKey, ids: null })
  const chosen = state.key === resetKey ? state.ids : null
  const selectedIds = chosen ?? (selectFirst && rows[0] ? [rows[0].orderNumber] : [])

  return {
    selectedIds,
    activeId: selectedIds.at(-1) ?? null,
    setSelectedIds: (ids) => setState({ key: resetKey, ids }),
    focusRow: (row) => setState({ key: resetKey, ids: [row.orderNumber] }),
    reset: () => setState({ key: resetKey, ids: null }),
  }
}
