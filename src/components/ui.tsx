import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-xl font-medium tracking-tight">{children}</h1>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 dark:text-neutral-600 mb-3">
      {children}
    </p>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-neutral-50 dark:bg-neutral-900 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

export function Divider() {
  return <div className="h-px bg-neutral-100 dark:bg-neutral-800" />
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string }
export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-sm text-[#111] dark:text-[#F0F0F0] placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500 transition-colors duration-150 ${className}`}
        {...props}
      />
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string }
export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-sm text-[#111] dark:text-[#F0F0F0] focus:outline-none focus:border-neutral-500 transition-colors duration-150 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}
export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'bg-[#111] dark:bg-[#F0F0F0] text-white dark:text-[#0A0A0A] hover:opacity-75',
    ghost:   'border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    danger:  'text-red-400 hover:text-red-500',
  }
  return (
    <button
      className={`rounded-xl font-medium transition-all duration-150 flex items-center gap-1.5 ${sizes[size]} ${variants[variant]} disabled:opacity-30 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'neutral' | 'green' | 'red' | 'blue' | 'orange' }) {
  const v = {
    neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
    green:   'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
    blue:    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    orange:  'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${v[variant]}`}>{children}</span>
}
