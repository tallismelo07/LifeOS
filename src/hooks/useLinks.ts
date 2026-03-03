import { useCallback, useState } from 'react'
import type { LinkItem } from '../types'
import { storage } from '../services/storage'
import { uid, today } from '../utils'

export function useLinks(username: string) {
  const store = storage.forUser(username)
  const [links, setLinks] = useState<LinkItem[]>(() => store.get<LinkItem[]>('links', []))

  const persist = useCallback((next: LinkItem[]) => { setLinks(next); store.set('links', next) }, [store])

  const addLink = (data: Omit<LinkItem, 'id' | 'createdAt'>) =>
    persist([...links, { ...data, id: uid(), createdAt: today() }])

  const removeLink = (id: string) => persist(links.filter((l) => l.id !== id))

  const updateLink = (id: string, data: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) =>
    persist(links.map((l) => l.id === id ? { ...l, ...data } : l))

  const categories = [...new Set(links.map((l) => l.category))].filter(Boolean)

  return { links, addLink, removeLink, updateLink, categories }
}
