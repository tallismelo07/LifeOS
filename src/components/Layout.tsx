import { type ReactNode } from 'react'
import { Home, DollarSign, Timer, CheckSquare, Link, Moon, Sun, LogOut } from 'lucide-react'
import { useNav } from '../context/NavContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import type { Page } from '../types'

const NAV: { id: Page; label: string; Icon: typeof Home }[] = [
  { id: 'home',     label: 'Início',   Icon: Home       },
  { id: 'finance',  label: 'Finanças', Icon: DollarSign },
  { id: 'pomodoro', label: 'Foco',     Icon: Timer      },
  { id: 'habits',   label: 'Hábitos',  Icon: CheckSquare},
  { id: 'links',    label: 'Links',    Icon: Link       },
]

export function Layout({ children }: { children: ReactNode }) {
  const { page, navigate } = useNav()
  const { user, logout }   = useAuth()
  const { theme, toggle }  = useTheme()

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-neutral-100 dark:border-neutral-900 px-5 py-3.5 flex items-center justify-between sticky top-0 z-20 bg-white dark:bg-[#0A0A0A]">
        <span className="text-sm font-semibold tracking-tight">LifeOS</span>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                page === id
                  ? 'bg-neutral-100 dark:bg-neutral-800 font-medium text-[#111] dark:text-[#F0F0F0]'
                  : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-600">
              {user.displayName}
            </span>
          )}
          <button onClick={toggle} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={logout} className="text-neutral-400 hover:text-red-400 transition-colors p-1" title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-[#0A0A0A] flex z-20">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] uppercase tracking-wider font-semibold transition-all duration-150 ${
              page === id
                ? 'text-[#111] dark:text-[#F0F0F0]'
                : 'text-neutral-300 dark:text-neutral-700'
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
