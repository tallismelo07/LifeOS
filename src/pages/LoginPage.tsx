import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

export function LoginPage() {
  const { login }           = useAuth()
  const { theme, toggle }   = useTheme()
  const [step, setStep]     = useState<'idle' | 'loading' | 'welcome'>('idle')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]   = useState('')
  const [welcomeName, setWelcomeName] = useState('')

  const submit = async () => {
    if (!username.trim() || !password) { setError('Preencha todos os campos.'); return }
    setError('')
    setStep('loading')
    await new Promise((r) => setTimeout(r, 500))
    const ok = login(username.trim(), password)
    if (!ok) { setError('Usuário ou senha incorretos.'); setStep('idle'); return }
    const name = username.trim().charAt(0).toUpperCase() + username.trim().slice(1)
    setWelcomeName(name)
    setStep('welcome')
    // login() already updated auth state; slight delay before app shows
    await new Promise((r) => setTimeout(r, 2200))
  }

  // Welcome animation screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center transition-colors">
        <div className="text-center px-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600 mb-6 animate-fadeIn">
            bem-vindo de volta
          </p>
          <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-[#111] dark:text-[#F0F0F0] animate-fadeUp">
            {welcomeName}
          </h1>
          <p className="text-neutral-400 dark:text-neutral-600 mt-5 text-sm animate-fadeUp delay-300">
            LifeOS está pronto.
          </p>
          <div className="mt-10 flex justify-center animate-fadeUp delay-500">
            <span className="text-2xl animate-pulse-soft">✦</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col transition-colors duration-300">
      <div className="flex justify-between items-center p-6">
        <span className="text-sm font-semibold tracking-tight text-[#111] dark:text-[#F0F0F0]">LifeOS</span>
        <button onClick={toggle} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="flex-1 flex items-center font-extrabold justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="mb-12 animate-fadeUp">
            <p className="text-[12px] uppercase font-extrabold tracking-[0.2em] text-neutral-300 dark:text-neutral-400 mb-3">
              sistema pessoal
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-[#111] dark:text-[#F0F0F0]">
              Olá.
            </h1>
            <p className="text-sm text-neutral-300 font-bold dark:text-neutral-400 mt-2">
              Identifique-se para continuar.
            </p>
          </div>

          <div className="space-y-7 animate-fadeUp delay-200">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold mb-2.5">
                Usuário
              </label>
              <input
                type="text"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="seu nome de usuário"
                className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2.5 text-sm text-[#111] dark:text-[#F0F0F0] placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none focus:border-neutral-600 dark:focus:border-neutral-400 transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold mb-2.5">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••••••"
                className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2.5 text-sm text-[#111] dark:text-[#F0F0F0] placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none focus:border-neutral-600 dark:focus:border-neutral-400 transition-colors duration-150"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 animate-slideDown">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={step === 'loading'}
              className="w-full bg-[#111] dark:bg-[#F0F0F0] text-white dark:text-[#0A0A0A] rounded-xl py-3 text-sm font-medium transition-all duration-200 hover:opacity-75 disabled:opacity-40 mt-2"
            >
              {step === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse-soft">···</span>
                </span>
              ) : 'Entrar'}
            </button>
          </div>

          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-400 text-center mt-10 animate-fadeIn delay-400">
            Acesso privado · Tallis &amp; Yasmin
          </p>
        </div>
      </div>
    </div>
  )
}
