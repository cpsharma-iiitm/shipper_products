import { useCallback } from 'react'

/** Returns `copy(text)`, which resolves true when the text reached the clipboard and false when the browser refused. */
export function useCopyToClipboard() {
  return useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [])
}
