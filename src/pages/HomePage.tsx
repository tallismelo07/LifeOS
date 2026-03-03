import { useFinance } from '../hooks/useFinance'
import { usePomodoro } from '../hooks/usePomodoro'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../context/AuthContext'
import { Card, SectionLabel } from '../components/ui'
import { ActivityGrid } from '../components/ActivityGrid'
import { StreakFlame } from '../components/StreakFlame'
import { habitService } from '../services/habitService'
import { greeting, formatCurrency, today } from '../utils'

export function HomePage() {
  const { user }           = useAuth()
  const username           = user!.username
  const { summary }        = useFinance(username)
  const { todayCount }     = usePomodoro(username)
  const { habits }         = useHabits(username)

  const allCompletions = new Set(habits.flatMap((h) => h.completions))
  const completedToday = habits.filter((h) => habitService.isCompleted(h, today())).length

  return (
    <div className="space-y-10" >
      {/* Greeting + streak */}
      <div className="flex items-start justify-between animate-fadeUp">
        <div>
          <p className="text-3xl font-normal tracking-tight">
            {greeting()},<br />
            <span className="font-extrabold">{user!.displayName}.</span>
          </p>
          <p className="text-sm text-neutral-400 font-extrabold dark:text-neutral-600 mt-2">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <StreakFlame username={username} />
      </div>

      {/* Financial summary */}
      <div className="animate-fadeUp delay-100">
        <SectionLabel>Este mês</SectionLabel>
        <Card>
          <div className="grid grid-cols-3 divide-x divide-neutral-100 dark:divide-neutral-800">
            <div className="pr-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">Entrou</p>
              <p className="text-base font-medium tabular-nums">{formatCurrency(summary.income)}</p>
            </div>
            <div className="px-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">Saiu</p>
              <p className="text-base font-medium tabular-nums">{formatCurrency(summary.expense)}</p>
            </div>
            <div className="pl-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">Saldo</p>
              <p className={`text-base font-medium tabular-nums ${summary.balance < 0 ? 'text-neutral-400' : ''}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today stats */}
      <div className="animate-fadeUp delay-200">
        <SectionLabel>Hoje</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2">Pomodoros</p>
            <p className="text-4xl font-light tabular-nums">{todayCount}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
              {todayCount === 0 ? 'Nenhum ainda' : `${todayCount * 25} min de foco`}
            </p>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2">Hábitos</p>
            <p className="text-4xl font-light tabular-nums">
              {completedToday}
              <span className="text-xl text-neutral-300 dark:text-neutral-700">/{habits.length}</span>
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
              {habits.length === 0 ? 'Nenhum hábito' : completedToday === habits.length && habits.length > 0 ? '🎉 Todos feitos!' : 'Concluídos hoje'}
            </p>
          </Card>
        </div>
      </div>

      {/* Activity grid */}
      <div className="animate-fadeUp delay-300">
        <SectionLabel>Atividade — último ano</SectionLabel>
        <Card>
          <ActivityGrid activeDates={allCompletions} />
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-3">
            {allCompletions.size} {allCompletions.size === 1 ? 'dia ativo' : 'dias ativos'}
          </p>
        </Card>
      </div>
    </div>
  )
}
