import type { User } from '../types'
import { storage } from './storage'

const USERS: Record<string, { password: string; displayName: string }> = {
  tallis:  { password: 'tallis0724@',  displayName: 'Tallis'  },
  yasmin: { password: 'yasmin0724@', displayName: 'Yasmin' },
}

const SESSION_KEY = 'lm_session'

export const authService = {
  login(username: string, password: string): User | null {
    const u = USERS[username.toLowerCase().trim()]
    if (!u || u.password !== password) return null
    const user: User = { username: username.toLowerCase().trim(), displayName: u.displayName }
    storage.set(SESSION_KEY, user)
    // track login streak
    const today = new Date().toISOString().split('T')[0]
    const streakKey = `lm_${user.username}_login_days`
    const days: string[] = storage.get(streakKey, [])
    if (!days.includes(today)) storage.set(streakKey, [...days, today])
    return user
  },
  logout(): void { storage.remove(SESSION_KEY) },
  current(): User | null { return storage.get<User | null>(SESSION_KEY, null) },
  getLoginDays(username: string): string[] {
    return storage.get<string[]>(`lm_${username}_login_days`, [])
  },
}
