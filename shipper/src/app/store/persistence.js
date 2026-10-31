export const persistKey = 'shipper-store';

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(persistKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePersistedState(state) {
  localStorage.setItem(persistKey, JSON.stringify(state));
}
