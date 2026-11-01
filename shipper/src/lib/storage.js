// Guarded wrappers around localStorage. Storage can be unavailable (private browsing, blocked site
// data) or throw when full, so every access is wrapped and the app must work without it.

export function readJson(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing useful to do: storage is unavailable.
  }
}

// Tab-scoped storage, used only for the demo session in mock mode (see app/store/persistence.js).
export function readSessionJson(key, fallback = null) {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeSessionJson(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeSessionItem(key) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Nothing useful to do: storage is unavailable.
  }
}
