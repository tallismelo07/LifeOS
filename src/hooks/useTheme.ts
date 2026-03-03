import { useEffect, useState } from 'react'
import { storage } from '../services/storage'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => storage.get<Theme>('lm_theme', 'dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    storage.set('lm_theme', theme)
  }, [theme])

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
