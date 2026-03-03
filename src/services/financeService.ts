import type { Transaction, PercentageSplit } from '../types'

export const financeService = {
  balance(transactions: Transaction[]): number {
    return transactions.reduce(
      (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0
    )
  },
  monthSummary(transactions: Transaction[], monthKey: string) {
    const f = transactions.filter((t) => t.date.startsWith(monthKey))
    const income  = f.filter((t) => t.type === 'income').reduce((a, t)  => a + t.amount, 0)
    const expense = f.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { income, expense, balance: income - expense, count: f.length }
  },
  applySplit(salary: number, split: PercentageSplit) {
    return {
      bills:   +((salary * split.bills)   / 100).toFixed(2),
      invest:  +((salary * split.invest)  / 100).toFixed(2),
      leisure: +((salary * split.leisure) / 100).toFixed(2),
    }
  },
  splitTotal(split: PercentageSplit): number {
    return +(split.bills + split.invest + split.leisure).toFixed(2)
  },
  categoryTotals(transactions: Transaction[], monthKey: string) {
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(monthKey)
    )
    const map: Record<string, number> = {}
    for (const t of expenses) {
      const c = t.category ?? 'outros'
      map[c] = (map[c] ?? 0) + t.amount
    }
    return map
  },
}
