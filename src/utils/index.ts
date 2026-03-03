export const today = (): string => new Date().toISOString().split('T')[0]

export const monthKey = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2)

export const greeting = (): string => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate()

export const monthDates = (year: number, month: number): string[] =>
  Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return d.toISOString().split('T')[0]
  })

export const allDatesLastYear = (): string[] => {
  const dates: string[] = []
  const now = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export const calcStreak = (days: string[]): number => {
  if (!days.length) return 0
  const sorted = [...new Set(days)].sort().reverse()
  let streak = 0
  const cursor = new Date(); cursor.setHours(0,0,0,0)
  for (const d of sorted) {
    const diff = Math.round((cursor.getTime() - new Date(d + 'T00:00:00').getTime()) / 86_400_000)
    if (diff > 1) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const monthLabel = (mk: string): string => {
  const [y, m] = mk.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
