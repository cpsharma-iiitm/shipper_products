/** Combines several refs (callback or object) into one callback ref. */
export function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    })
  }
}
