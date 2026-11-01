// Editing helpers for the role permission matrix.
//
// Permissions here are display and editing UI only. Nothing in the browser authorizes anything: the backend
// checks every request against the signed-in user's role. These helpers only keep the checkboxes consistent
// (write includes read) before the draft is saved.

const RANK = { none: 0, read: 1, write: 2 }

export const atLeast = (level, minimum) => RANK[level ?? 'none'] >= RANK[minimum]

/** Modules in the order the backend lists them, split by `group`: [{ group, modules }]. */
export function groupModules(modules) {
  const groups = []
  modules.forEach((module) => {
    const current = groups.find((entry) => entry.group === module.group)
    if (current) current.modules.push(module)
    else groups.push({ group: module.group, modules: [module] })
  })
  return groups
}

function nextLevel(current, access, enabled) {
  if (access === 'write') return enabled ? 'write' : atLeast(current, 'read') ? 'read' : 'none'
  if (!enabled) return 'none'
  return atLeast(current, 'write') ? 'write' : 'read'
}

/** Ticking Write also grants Read; unticking Read also removes Write. */
export const toggleModule = (permissions, key, access, enabled) => ({ ...permissions, [key]: nextLevel(permissions[key], access, enabled) })

export function toggleGroup(permissions, modules, access, enabled) {
  return { ...permissions, ...Object.fromEntries(modules.map(({ key }) => [key, nextLevel(permissions[key], access, enabled)])) }
}

/** 'all' | 'some' | 'none' of the group's modules grant at least this access. */
export function groupState(permissions, modules, access) {
  const granted = modules.filter(({ key }) => atLeast(permissions[key], access)).length
  if (granted === 0) return 'none'
  return granted === modules.length ? 'all' : 'some'
}

export const samePermissions = (a, b) => Object.keys({ ...a, ...b }).every((key) => (a[key] ?? 'none') === (b[key] ?? 'none'))
