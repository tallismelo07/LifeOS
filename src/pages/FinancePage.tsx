import { useState } from 'react'
import { Trash2, Plus, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useAuth } from '../context/AuthContext'
import { PageTitle, SectionLabel, Card, Input, Select, Btn, Divider, Badge } from '../components/ui'
import { today, formatCurrency, formatDate, monthKey, monthLabel, uid } from '../utils'
import type { ExpenseCategory, FinancialGoal } from '../types'

type Tab = 'extract' | 'add' | 'split' | 'goals'

const CATEGORIES: ExpenseCategory[] = ['contas','lazer','investimento','alimentação','saúde','transporte','educação','outros']

export function FinancePage() {
  const { user }  = useAuth()
  const finance   = useFinance(user!.username)
  const [tab, setTab] = useState<Tab>('extract')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'extract', label: 'Extrato'   },
    { id: 'add',     label: '+ Lançar'  },
    { id: 'split',   label: 'Divisão %' },
    { id: 'goals',   label: 'Metas'     },
  ]

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <PageTitle>Finanças</PageTitle>
        <div className="flex gap-1 flex-wrap justify-end">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-150 font-medium ${
                tab === t.id
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                  : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'extract' && <ExtractSection finance={finance} />}
      {tab === 'add'     && <AddSection finance={finance} onDone={() => setTab('extract')} />}
      {tab === 'split'   && <SplitSection finance={finance} />}
      {tab === 'goals'   && <GoalsSection finance={finance} />}
    </div>
  )
}

// ─── Extract ──────────────────────────────────────────────────────────────────
function ExtractSection({ finance }: { finance: ReturnType<typeof useFinance> }) {
  const { transactions, availableMonths, transactionsByMonth, removeTransaction, categoryTotals } = finance
  const [selectedMonth, setSelectedMonth] = useState(monthKey())

  const filtered = transactionsByMonth(selectedMonth)
  const income  = filtered.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = filtered.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const catTotals = finance.categoryTotals // using month-specific data already in hook

  // recalculate for selected month
  const selectedCatTotals: Record<string, number> = {}
  filtered.filter((t) => t.type === 'expense').forEach((t) => {
    const c = t.category ?? 'outros'
    selectedCatTotals[c] = (selectedCatTotals[c] ?? 0) + t.amount
  })
  const maxCat = Math.max(...Object.values(selectedCatTotals), 1)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Resumo</SectionLabel>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs bg-transparent text-neutral-400 dark:text-neutral-600 focus:outline-none cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 divide-x divide-neutral-100 dark:divide-neutral-800">
          <div className="pr-4">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={11} className="text-neutral-400" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Entrou</p>
            </div>
            <p className="text-sm font-medium tabular-nums">{formatCurrency(income)}</p>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown size={11} className="text-neutral-400" />
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Saiu</p>
            </div>
            <p className="text-sm font-medium tabular-nums">{formatCurrency(expense)}</p>
          </div>
          <div className="pl-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-1">Saldo</p>
            <p className={`text-sm font-medium tabular-nums ${income - expense < 0 ? 'text-neutral-400' : ''}`}>
              {formatCurrency(income - expense)}
            </p>
          </div>
        </div>
      </Card>

      {/* Category breakdown */}
      {Object.keys(selectedCatTotals).length > 0 && (
        <Card>
          <SectionLabel>Por categoria</SectionLabel>
          <div className="space-y-2.5">
            {Object.entries(selectedCatTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-500 dark:text-neutral-400 capitalize">{cat}</span>
                    <span className="tabular-nums text-neutral-500 dark:text-neutral-400">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-1 bg-neutral-400 dark:bg-neutral-500 rounded-full transition-all duration-500"
                      style={{ width: `${(total / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Movimentações</SectionLabel>
          {filtered.length > 0 && (
            <button
              onClick={() => exportPDF(filtered, selectedMonth, income, expense)}
              className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-semibold"
            >
              Exportar PDF
            </button>
          )}
        </div>

        <Card>
          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-600 py-4 text-center">
              Nenhuma movimentação em {monthLabel(selectedMonth)}.
            </p>
          ) : (
            <div>
              {filtered.map((t, i) => (
                <div key={t.id}>
                  <div className="flex items-center justify-between py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-neutral-400 dark:text-neutral-600">{formatDate(t.date)}</p>
                        {t.category && (
                          <Badge variant="neutral">{t.category}</Badge>
                        )}
                        {t.recurring && <Badge variant="blue">recorrente</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-medium tabular-nums ${
                        t.type === 'income' ? '' : 'text-neutral-400 dark:text-neutral-500'
                      }`}>
                        {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                      </span>
                      <button onClick={() => removeTransaction(t.id)}
                        className="text-neutral-200 dark:text-neutral-800 hover:text-red-400 dark:hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {i < filtered.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Add Transaction ──────────────────────────────────────────────────────────
function AddSection({ finance, onDone }: { finance: ReturnType<typeof useFinance>; onDone: () => void }) {
  const [type, setType]       = useState<'income' | 'expense'>('expense')
  const [amount, setAmount]   = useState('')
  const [date, setDate]       = useState(today())
  const [desc, setDesc]       = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('contas')
  const [recurring, setRecurring] = useState(false)
  const [success, setSuccess] = useState(false)

  const submit = () => {
    const v = parseFloat(amount.replace(',', '.'))
    if (!v || v <= 0 || !desc.trim()) return
    finance.addTransaction({
      type, amount: v, date, description: desc.trim(), recurring,
      ...(type === 'expense' ? { category } : {}),
    })
    setAmount(''); setDesc(''); setDate(today()); setRecurring(false)
    setSuccess(true)
    setTimeout(() => { setSuccess(false); onDone() }, 800)
  }

  return (
    <Card>
      <SectionLabel>Nova movimentação</SectionLabel>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        {(['expense', 'income'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`flex-1 py-2.5 text-xs rounded-xl transition-all duration-150 font-medium ${
              type === t
                ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                : 'text-neutral-400 dark:text-neutral-600'
            }`}>
            {t === 'income' ? '↑ Entrada' : '↓ Saída'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <Input label="Valor (R$)" type="number" inputMode="decimal" placeholder="0,00"
          value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Descrição" placeholder="Ex: Salário, Mercado, Netflix..."
          value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        {type === 'expense' && (
          <Select label="Categoria" value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </Select>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setRecurring(!recurring)}
            className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${
              recurring ? 'bg-neutral-700 dark:bg-neutral-300' : 'bg-neutral-200 dark:bg-neutral-800'
            }`}>
            <span className={`w-4 h-4 rounded-full bg-white dark:bg-[#0A0A0A] shadow transition-transform duration-200 ${
              recurring ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Recorrente (mensal)</span>
        </label>

        <Btn onClick={submit} className="w-full justify-center mt-2">
          {success ? '✓ Adicionado!' : 'Adicionar'}
        </Btn>
      </div>
    </Card>
  )
}

// ─── Split ────────────────────────────────────────────────────────────────────
function SplitSection({ finance }: { finance: ReturnType<typeof useFinance> }) {
  const { salary, split, distribution } = finance
  const [localSalary, setLocalSalary] = useState(salary > 0 ? String(salary) : '')
  const [local, setLocal] = useState(split)
  const total = +(local.bills + local.invest + local.leisure).toFixed(2)
  const valid = Math.abs(total - 100) < 0.01

  const save = () => {
    if (!valid) return
    finance.setSalary(parseFloat(localSalary.replace(',', '.')) || 0)
    finance.setSplit(local)
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel>Salário mensal</SectionLabel>
        <Input type="number" inputMode="decimal" placeholder="Ex: 5000"
          value={localSalary} onChange={(e) => setLocalSalary(e.target.value)} />
      </Card>

      <Card>
        <SectionLabel>Divisão percentual</SectionLabel>
        <div className="space-y-4">
          {([['bills','Contas 🏠'],['invest','Investimentos 📈'],['leisure','Lazer 🎯']] as const).map(([k, l]) => (
            <div key={k} className="flex items-center gap-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400 w-36 shrink-0">{l}</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="range" min={0} max={100} value={local[k]}
                  onChange={(e) => setLocal({ ...local, [k]: parseFloat(e.target.value) })}
                  className="flex-1 accent-neutral-700 dark:accent-neutral-300" />
                <span className="text-sm font-medium w-8 text-right tabular-nums">{local[k]}%</span>
              </div>
            </div>
          ))}
          <p className={`text-xs mt-1 ${valid ? 'text-neutral-400' : 'text-red-400'}`}>
            Total: {total}% {!valid && '— precisa ser 100%'}
          </p>
          <Btn onClick={save} disabled={!valid}>Salvar divisão</Btn>
        </div>
      </Card>

      {salary > 0 && (
        <Card>
          <SectionLabel>Com base em {formatCurrency(salary)}</SectionLabel>
          <div className="space-y-3">
            {([['bills','Contas'],['invest','Investimentos'],['leisure','Lazer']] as const).map(([k, l]) => (
              <div key={k} className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{l}</span>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(distribution[k])}</span>
              </div>
            ))}
            <Divider />
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-neutral-400 dark:text-neutral-600">Total distribuído</span>
              <span className="text-xs tabular-nums text-neutral-400">{formatCurrency(distribution.bills + distribution.invest + distribution.leisure)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Goals ────────────────────────────────────────────────────────────────────
function GoalsSection({ finance }: { finance: ReturnType<typeof useFinance> }) {
  const { goals, addGoal, updateGoal, removeGoal } = finance
  const [name, setName]       = useState('')
  const [target, setTarget]   = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const submit = () => {
    if (!name.trim() || !target) return
    addGoal({
      name: name.trim(),
      target: parseFloat(target.replace(',', '.')) || 0,
      current: parseFloat(current.replace(',', '.')) || 0,
      deadline: deadline || undefined,
    })
    setName(''); setTarget(''); setCurrent(''); setDeadline('')
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel>Nova meta</SectionLabel>
        <div className="space-y-4">
          <Input label="Nome da meta" placeholder="Ex: Reserva de emergência"
            value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor alvo (R$)" type="number" placeholder="10000"
              value={target} onChange={(e) => setTarget(e.target.value)} />
            <Input label="Valor atual (R$)" type="number" placeholder="0"
              value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <Input label="Prazo (opcional)" type="date"
            value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Btn onClick={submit} className="w-full justify-center">
            <Plus size={14} /> Criar meta
          </Btn>
        </div>
      </Card>

      {goals.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-600 text-center py-6">
          Nenhuma meta criada ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">{g.name}</p>
                    {g.deadline && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
                        Prazo: {formatDate(g.deadline)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500">{Math.round(pct)}%</span>
                    <button onClick={() => removeGoal(g.id)}
                      className="text-neutral-200 dark:text-neutral-800 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
                  <div className="h-1.5 bg-neutral-700 dark:bg-neutral-300 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Atual</p>
                      <p className="text-sm font-medium tabular-nums">{formatCurrency(g.current)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Meta</p>
                      <p className="text-sm font-medium tabular-nums">{formatCurrency(g.target)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Falta</p>
                      <p className="text-sm text-neutral-400 tabular-nums">{formatCurrency(Math.max(0, g.target - g.current))}</p>
                    </div>
                  </div>

                  {editing === g.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={editVal} onChange={(e) => setEditVal(e.target.value)}
                        className="w-24 text-xs bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none py-1 tabular-nums"
                        placeholder="Novo valor" autoFocus />
                      <button onClick={() => { updateGoal(g.id, parseFloat(editVal) || g.current); setEditing(null) }}
                        className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:opacity-70">ok</button>
                      <button onClick={() => setEditing(null)}
                        className="text-xs text-neutral-400">×</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(g.id); setEditVal(String(g.current)) }}
                      className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-semibold">
                      Atualizar
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
function exportPDF(transactions: any[], month: string, income: number, expense: number) {
  const rows = transactions.map((t) =>
    `<tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.description}</td>
      <td>${t.category ?? '—'}</td>
      <td style="text-align:right;color:${t.type==='income'?'#111':'#888'}">${t.type==='income'?'+':'−'} ${formatCurrency(t.amount)}</td>
    </tr>`
  ).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Extrato ${month}</title>
  <style>body{font-family:system-ui,sans-serif;font-size:13px;color:#111;padding:32px}h1{font-size:20px;font-weight:500;margin-bottom:4px}p.sub{color:#888;font-size:12px;margin-bottom:24px}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#888;border-bottom:1px solid #eee;padding:8px 0}td{padding:10px 0;border-bottom:1px solid #f5f5f5}.totals{margin-top:24px;display:flex;gap:32px}.totals div{font-size:12px;color:#888}.totals strong{display:block;font-size:15px;font-weight:500;color:#111;margin-top:2px}</style>
  </head><body>
  <h1>Extrato — ${monthLabel(month)}</h1>
  <p class="sub">Gerado em ${new Date().toLocaleDateString('pt-BR')} · LifeOS</p>
  <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="totals">
    <div>Entrou<strong>${formatCurrency(income)}</strong></div>
    <div>Saiu<strong>${formatCurrency(expense)}</strong></div>
    <div>Saldo<strong>${formatCurrency(income-expense)}</strong></div>
  </div>
  <script>window.onload=()=>{window.print();window.close()}</script>
  </body></html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}
