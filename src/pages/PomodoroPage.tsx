import { useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react'
import { usePomodoro } from '../hooks/usePomodoro'
import { useAuth } from '../context/AuthContext'
import { PageTitle, SectionLabel, Card, Btn } from '../components/ui'

const PHASE_LABELS = {
  work:       'Foco',
  shortBreak: 'Pausa curta',
  longBreak:  'Pausa longa',
}

const PHASE_EMOJIS = {
  work:       '🎯',
  shortBreak: '☕',
  longBreak:  '🌿',
}

export function PomodoroPage() {
  const { user }       = useAuth()
  const pomo           = usePomodoro(user!.username)
  const [showSettings, setShowSettings] = useState(false)
  const [localSettings, setLocalSettings] = useState(pomo.settings)

  const saveSettings = () => {
    pomo.updateSettings(localSettings)
    setShowSettings(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center font-extrabold justify-between">
        <PageTitle>Foco - Pomodoro</PageTitle>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-1"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <Card className="animate-slideDown">
          <SectionLabel>Configurar tempos</SectionLabel>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {([
              ['workMinutes',       'Foco (min)'],
              ['shortBreakMinutes', 'Pausa curta (min)'],
              ['longBreakMinutes',  'Pausa longa (min)'],
              ['cyclesBeforeLong',  'Ciclos p/ pausa longa'],
            ] as const).map(([k, l]) => (
              <div key={k}>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600  mb-1.5">
                  {l}
                </label>
                <input
                  type="number" min={1} max={k === 'cyclesBeforeLong' ? 10 : 99}
                  value={localSettings[k]}
                  onChange={(e) => setLocalSettings({ ...localSettings, [k]: parseInt(e.target.value) || 1 })}
                  className="w-full bg-transparent border-b  border-neutral-200 dark:border-neutral-800 py-2 text-sm focus:outline-none focus:border-neutral-500 transition-colors text-center tabular-nums"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn onClick={saveSettings}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowSettings(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}

      {/* Phase indicator */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {(['work', 'shortBreak', 'longBreak'] as const).map((p) => (
            <span
              key={p}
              className={`text-[10px] uppercase tracking-widest font-semibold transition-all duration-200 ${
                pomo.phase === p
                  ? 'text-[#111] dark:text-[#F0F0F0]'
                  : 'text-neutral-300 dark:text-neutral-700'
              }`}
            >
              {PHASE_LABELS[p]}
            </span>
          ))}
        </div>

        {/* Big timer */}
        <div className="py-12">
          <p className="text-[88px] sm:text-[110px] tabular-nums tracking-tight leading-none text-[#111] font-black dark:text-[#F0F0F0]">
            {pomo.display}
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-600 mt-3">
            {PHASE_EMOJIS[pomo.phase]} {PHASE_LABELS[pomo.phase]}
            {pomo.phase !== 'work' && ' — Descanse um pouco'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden mb-10 max-w-xs mx-auto">
          <div
            className="h-0.5 bg-neutral-400 dark:bg-neutral-500 rounded-full transition-all duration-1000"
            style={{ width: `${(1 - pomo.progress) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Btn variant="ghost" size="sm" onClick={pomo.reset}>
            <RotateCcw size={14} />
          </Btn>
          <Btn
            className="px-10 py-3 text-base"
            onClick={pomo.running ? pomo.pause : pomo.play}
          >
            {pomo.running
              ? <><Pause size={16} /> Pausar</>
              : <><Play size={16} /> {pomo.phase === 'work' ? 'Iniciar' : 'Descansar'}</>
            }
          </Btn>
          <Btn variant="ghost" size="sm" onClick={pomo.skipPhase} title="Pular fase">
            <SkipForward size={14} />
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center !p-4">
          <p className="text-3xl font-light tabular-nums">{pomo.todayCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mt-1">Hoje</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-3xl font-light tabular-nums">{pomo.cycles}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mt-1">Sessão</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-3xl font-light tabular-nums">{pomo.todayCount * pomo.settings.workMinutes}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mt-1">Minutos</p>
        </Card>
      </div>

      {/* Cycle visual */}
      <Card>
        <SectionLabel>
          Ciclos — pausa longa a cada {pomo.settings.cyclesBeforeLong}
        </SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: Math.max(pomo.cycles, pomo.settings.cyclesBeforeLong) }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                i < pomo.cycles
                  ? 'bg-neutral-700 dark:bg-neutral-300'
                  : 'bg-neutral-100 dark:bg-neutral-800'
              } ${i > 0 && (i + 1) % pomo.settings.cyclesBeforeLong === 0 ? 'mr-3' : ''}`}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
