const _get = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

const _set = <T>(key: string, value: T): void => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const storage = {
  get: _get,
  set: _set,
  remove: (key: string) => { try { localStorage.removeItem(key) } catch {} },
  forUser(username: string) {
    return {
      get<T>(key: string, fallback: T): T { return _get(`lm_${username}_${key}`, fallback) },
      set<T>(key: string, value: T): void { _set(`lm_${username}_${key}`, value) },
    }
  },
}
