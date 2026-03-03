import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services/authService'

interface AuthCtx {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const Ctx = createContext<AuthCtx>({ user: null, login: () => false, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.current())

  const login = (username: string, password: string): boolean => {
    const u = authService.login(username, password)
    if (u) { setUser(u); return true }
    return false
  }

  const logout = () => { authService.logout(); setUser(null) }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
