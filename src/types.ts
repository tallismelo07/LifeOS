export type TransactionType = 'income' | 'expense'
export type ExpenseCategory =
  | 'contas'
  | 'lazer'
  | 'investimento'
  | 'alimentação'
  | 'saúde'
  | 'transporte'
  | 'educação'
  | 'outros'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  description: string
  category?: ExpenseCategory
  recurring?: boolean
}

export interface FinancialGoal {
  id: string
  name: string
  target: number
  current: number
  deadline?: string
}

export interface PercentageSplit {
  bills: number
  invest: number
  leisure: number
}

export interface FinanceState {
  transactions: Transaction[]
  salary: number
  split: PercentageSplit
  goals: FinancialGoal[]
}

export interface Habit {
  id: string
  name: string
  completions: string[]
}

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export interface PomodoroSession {
  date: string
  completedAt: number
  phase: PomodoroPhase
}

export interface PomodoroSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  cyclesBeforeLong: number
}

export interface PomodoroState {
  sessions: PomodoroSession[]
  settings: PomodoroSettings
}

export interface LinkItem {
  id: string
  title: string
  url: string
  description?: string
  category: string
  createdAt: string
}

export type Page = 'home' | 'finance' | 'pomodoro' | 'habits' | 'links'

export interface User {
  username: string
  displayName: string
}
