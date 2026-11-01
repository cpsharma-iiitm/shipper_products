import { createContext, use } from 'react'
import { createPortal } from 'react-dom'

const HeaderActionsContext = createContext(null)

/** Provided by the workspace: the element inside the page header where stage actions are shown. */
export const HeaderActionsProvider = HeaderActionsContext

/**
 * Renders its children into the page header's action area. Each stage owns its header buttons (Print pick
 * list, Export shipments, …) because they act on the stage's own filters and selection, while the header
 * and tabs stay mounted across stages so keyboard focus is not lost when switching tabs.
 */
export default function HeaderActions({ children }) {
  const slot = use(HeaderActionsContext)
  return slot ? createPortal(children, slot) : null
}
