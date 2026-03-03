import { useCallback, useEffect, useRef, useState } from 'react'
import type { PomodoroState, PomodoroPhase } from '../types'
import { storage } from '../services/storage'
import { today } from '../utils'

const DEFAULT_SETTINGS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLong: 4,
}

export function usePomodoro(username: string) {
  const store = storage.forUser(username)

  const [state, setState] = useState<PomodoroState>(() =>
    store.get<PomodoroState>('pomodoro', { sessions: [], settings: DEFAULT_SETTINGS })
  )

  const [phase, setPhase]     = useState<PomodoroPhase>('work')
  const [running, setRunning] = useState(false)
  const [cycles, setCycles]   = useState(0)
  const [timeLeft, setTimeLeft] = useState(state.settings.workMinutes * 60)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const persist = useCallback((next: PomodoroState) => {
    setState(next); store.set('pomodoro', next)
  }, [store])

  const phaseDuration = useCallback((p: PomodoroPhase, s = state.settings): number => {
    if (p === 'work')       return s.workMinutes * 60
    if (p === 'shortBreak') return s.shortBreakMinutes * 60
    return s.longBreakMinutes * 60
  }, [state.settings])

  useEffect(() => {
    if (!running) setTimeLeft(phaseDuration(phase))
  }, [state.settings])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === 'work') {
              const next = cycles + 1
              setCycles(next)
              persist({
                ...state,
                sessions: [...state.sessions, { date: today(), completedAt: Date.now(), phase: 'work' }],
              })
              const nextPhase: PomodoroPhase =
                next % state.settings.cyclesBeforeLong === 0 ? 'longBreak' : 'shortBreak'
              setPhase(nextPhase)
              setTimeLeft(phaseDuration(nextPhase))
            } else {
              setPhase('work')
              setTimeLeft(phaseDuration('work'))
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, cycles, state, persist, phaseDuration])

  const play  = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setTimeLeft(phaseDuration(phase)) }
  const skipPhase = () => {
    setRunning(false)
    const next: PomodoroPhase = phase === 'work'
      ? (cycles % state.settings.cyclesBeforeLong === 0 ? 'longBreak' : 'shortBreak')
      : 'work'
    setPhase(next)
    setTimeLeft(phaseDuration(next))
  }

  const updateSettings = (patch: Partial<typeof DEFAULT_SETTINGS>) => {
    const next = { ...state, settings: { ...state.settings, ...patch } }
    persist(next)
    if (!running) setTimeLeft(phaseDuration(phase, next.settings))
  }

  const todayCount = state.sessions.filter((s) => s.date === today() && s.phase === 'work').length
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const progress = timeLeft / phaseDuration(phase)

  return {
    display: `${mm}:${ss}`,
    running, phase, cycles, todayCount, progress,
    settings: state.settings,
    play, pause, reset, skipPhase, updateSettings,
  }
}
