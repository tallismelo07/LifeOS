import { calcStreak } from '../utils'
import { authService } from '../services/authService'

interface Props { username: string }

export function StreakFlame({ username }: Props) {
  const days  = authService.getLoginDays(username)
  const streak = calcStreak(days)
  const total  = days.length

  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg animate-flame inline-block select-none" title="Sequência de uso">🔥</span>
      <div>
        <p className="text-xl font-light tabular-nums leading-none animate-countUp">
          {streak}
          <span className="text-sm text-neutral-400 dark:text-neutral-600 ml-1">
            {streak === 1 ? 'dia' : 'dias'}
          </span>
        </p>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mt-0.5">
          {total} {total === 1 ? 'dia' : 'dias'} no total
        </p>
      </div>
    </div>
  )
}
