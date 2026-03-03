import { useCallback, useState } from 'react'
import type { Transaction, PercentageSplit, FinanceState, FinancialGoal } from '../types'
import { storage } from '../services/storage'
import { financeService } from '../services/financeService'
import { uid, today, monthKey } from '../utils'

const DEFAULTS: FinanceState = {
  transactions: [],
  salary: 0,
  split: { bills: 50, invest: 30, leisure: 20 },
  goals: [],
}

export function useFinance(username: string) {
  const store = storage.forUser(username)

  const [state, setState] = useState<FinanceState>(() =>
    store.get<FinanceState>('finance', DEFAULTS)
  )

  const persist = useCallback((next: FinanceState) => {
    setState(next); store.set('finance', next)
  }, [store])

  const addTransaction = (t: Omit<Transaction, 'id'>) =>
    persist({ ...state, transactions: [...state.transactions, { ...t, id: uid() }] })

  const removeTransaction = (id: string) =>
    persist({ ...state, transactions: state.transactions.filter((t) => t.id !== id) })

  const setSalary = (salary: number) => persist({ ...state, salary })

  const setSplit = (split: PercentageSplit) => persist({ ...state, split })

  const addGoal = (g: Omit<FinancialGoal, 'id'>) =>
    persist({ ...state, goals: [...state.goals, { ...g, id: uid() }] })

  const updateGoal = (id: string, current: number) =>
    persist({ ...state, goals: state.goals.map((g) => g.id === id ? { ...g, current } : g) })

  const removeGoal = (id: string) =>
    persist({ ...state, goals: state.goals.filter((g) => g.id !== id) })

  const currentMonth = monthKey()
  const summary = financeService.monthSummary(state.transactions, currentMonth)
  const distribution = financeService.applySplit(state.salary, state.split)
  const splitTotal = financeService.splitTotal(state.split)
  const balance = financeService.balance(state.transactions)
  const categoryTotals = financeService.categoryTotals(state.transactions, currentMonth)

  const transactionsByMonth = useCallback(
    (mk: string) =>
      [...state.transactions]
        .filter((t) => t.date.startsWith(mk))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.transactions]
  )

  const availableMonths = [
    ...new Set(state.transactions.map((t) => t.date.slice(0, 7)))
  ].sort().reverse()
  if (!availableMonths.includes(currentMonth)) availableMonths.unshift(currentMonth)

  return {
    transactions: state.transactions,
    salary: state.salary,
    split: state.split,
    goals: state.goals,
    summary,
    distribution,
    splitTotal,
    balance,
    categoryTotals,
    availableMonths,
    addTransaction,
    removeTransaction,
    setSalary,
    setSplit,
    addGoal,
    updateGoal,
    removeGoal,
    transactionsByMonth,
  }
}
