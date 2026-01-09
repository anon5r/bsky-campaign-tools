const STORAGE_KEY = 'bsky_login_history'
const MAX_HISTORY = 10

export function getLoginHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function addToLoginHistory(handle: string) {
  const history = getLoginHistory()
  // Remove existing if present to move it to top
  const filtered = history.filter(h => h.toLowerCase() !== handle.toLowerCase())
  // Add to front
  const newHistory = [handle, ...filtered].slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
}

export function clearLoginHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
