import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Page } from '../types'

interface NavCtx { page: Page; navigate: (p: Page) => void }
const Ctx = createContext<NavCtx>({ page: 'home', navigate: () => {} })

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home')
  return <Ctx.Provider value={{ page, navigate: setPage }}>{children}</Ctx.Provider>
}

export const useNav = () => useContext(Ctx)
