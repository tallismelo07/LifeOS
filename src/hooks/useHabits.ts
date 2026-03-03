import { useCallback, useState } from 'react'
import type { Habit } from '../types'
import { storage } from '../services/storage'
import { habitService } from '../services/habitService'
import { uid } from '../utils'

export function useHabits(username: string) {
  const store = storage.forUser(username)
  const [habits, setHabits] = useState<Habit[]>(() => store.get<Habit[]>('habits', []))

  const persist = useCallback((next: Habit[]) => { setHabits(next); store.set('habits', next) }, [store])

  return {
    habits,
    addHabit:    (name: string) => persist([...habits, { id: uid(), name, completions: [] }]),
    removeHabit: (id: string)   => persist(habits.filter((h) => h.id !== id)),
    toggleDay:   (id: string, date: string) =>
      persist(habits.map((h) => h.id === id ? habitService.toggle(h, date) : h)),
  }
}
