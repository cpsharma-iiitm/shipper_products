export const USER_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const USER_FORM_STATUS_OPTIONS = USER_STATUS_OPTIONS.filter((option) => option.value)

/** Access levels of the permission matrix. Write includes read. */
export const ACCESS_LEVELS = { none: 'none', read: 'read', write: 'write' }
