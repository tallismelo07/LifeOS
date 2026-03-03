import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../context/AuthContext'
import { habitService } from '../services/habitService'
import { PageTitle, SectionLabel, Card, Input, Btn } from '../components/ui'
import { monthKey, monthDates, today } from '../utils'
import type { Habit } from '../types'

export function HabitsPage() {
  const { user }                          = useAuth()
  const { habits, addHabit, removeHabit, toggleDay } = useHabits(user!.username)
  const [newName, setNewName]             = useState('')

  const completedToday = habits.filter((h) => habitService.isCompleted(h, today())).length

  const submit = () => {
    if (!newName.trim()) return
    addHabit(newName.trim()); setNewName('')
  }

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <PageTitle>Hábitos</PageTitle>
        {habits.length > 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-600">
            {completedToday}/{habits.length} hoje
          </p>
        )}
      </div>

      {/* Add */}
      <Card>
        <SectionLabel>Novo hábito</SectionLabel>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input placeholder="Ex: Meditar, Ler, Exercitar..."
              value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          <Btn onClick={submit} size="sm"><Plus size={14} />Adicionar</Btn>
        </div>
      </Card>

      {habits.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-600 text-center py-10">
          Nenhum hábito ainda. Crie um acima.
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h}
              onRemove={() => removeHabit(h.id)}
              onToggle={(date) => toggleDay(h.id, date)} />
          ))}
        </div>
      )}
    </div>
  )
}

function HabitCard({
  habit, onRemove, onToggle,
}: { habit: Habit; onRemove: () => void; onToggle: (d: string) => void }) {
  const [open, setOpen]       = useState(false)
  const [viewDate, setViewDate] = useState(new Date())

  const streak       = habitService.streak(habit)
  const doneToday    = habitService.isCompleted(habit, today())
  const yr = viewDate.getFullYear(), mo = viewDate.getMonth()
  const dates        = monthDates(yr, mo)
  const firstDay     = new Date(yr, mo, 1).getDay()
  const monthTotal   = habitService.monthCompletions(habit, monthKey(viewDate))
  const label        = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <Card>
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-3 text-left">
          <div className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-200 ${
            doneToday ? 'bg-[#111] dark:bg-[#F0F0F0]' : 'bg-neutral-200 dark:bg-neutral-700'
          }`} />
          <span className="text-sm font-medium">{habit.name}</span>
        </button>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600 flex items-center gap-1">
              🔥 {streak}d
            </span>
          )}
          <button onClick={onRemove}
            className="text-neutral-200 dark:text-neutral-800 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 animate-fadeIn">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewDate(new Date(yr, mo - 1, 1))}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1">
              <ChevronLeft size={14} />
            </button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
              {label} · <span className="font-medium">{monthTotal}</span> {monthTotal === 1 ? 'dia' : 'dias'}
            </p>
            <button onClick={() => setViewDate(new Date(yr, mo + 1, 1))}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-neutral-300 dark:text-neutral-700 py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {dates.map((date) => {
              const done = habitService.isCompleted(habit, date)
              const num  = parseInt(date.split('-')[2])
              const isToday = date === today()
              return (
                <button key={date} onClick={() => onToggle(date)}
                  className={`mx-auto flex items-center justify-center w-7 h-7 rounded-lg text-xs transition-all duration-100 ${
                    done
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium'
                      : isToday
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                      : 'text-neutral-400 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}>
                  {num}
                </button>
              )
            })}
          </div>

          {streak > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mt-4 text-center">
              🔥 {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
