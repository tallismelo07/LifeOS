import type { Habit } from '../types'

export const habitService = {
  streak(habit: Habit): number {
    if (!habit.completions.length) return 0
    const sorted = [...new Set(habit.completions)].sort().reverse()
    let streak = 0
    const cursor = new Date(); cursor.setHours(0,0,0,0)
    for (const d of sorted) {
      const diff = Math.round((cursor.getTime() - new Date(d + 'T00:00:00').getTime()) / 86_400_000)
      if (diff > 1) break
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  },
  monthCompletions: (h: Habit, mk: string) => h.completions.filter((d) => d.startsWith(mk)).length,
  isCompleted: (h: Habit, date: string) => h.completions.includes(date),
  toggle: (h: Habit, date: string): Habit => ({
    ...h,
    completions: h.completions.includes(date)
      ? h.completions.filter((d) => d !== date)
      : [...h.completions, date],
  }),
}
