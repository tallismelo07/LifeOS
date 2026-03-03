import { useState } from 'react'
import { ExternalLink, Trash2, Plus, Link, Pencil, Check, X } from 'lucide-react'
import { useLinks } from '../hooks/useLinks'
import { useAuth } from '../context/AuthContext'
import { PageTitle, SectionLabel, Card, Input, Btn, Badge } from '../components/ui'
import type { LinkItem } from '../types'

const PRESET_CATEGORIES = ['Estudos', 'Cursos', 'Trabalho', 'Ferramentas', 'Entretenimento', 'Outros']

export function LinksPage() {
  const { user }                               = useAuth()
  const { links, addLink, removeLink, updateLink, categories } = useLinks(user!.username)

  const [showForm, setShowForm]   = useState(false)
  const [filter, setFilter]       = useState<string>('todos')
  const [editingId, setEditingId] = useState<string | null>(null)

  // form state
  const [title, setTitle]         = useState('')
  const [url, setUrl]             = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('Estudos')
  const [customCat, setCustomCat] = useState('')

  const resetForm = () => {
    setTitle(''); setUrl(''); setDesc(''); setCategory('Estudos'); setCustomCat(''); setShowForm(false)
  }

  const submit = () => {
    if (!title.trim() || !url.trim()) return
    const finalUrl = url.startsWith('http') ? url : `https://${url}`
    addLink({
      title: title.trim(),
      url: finalUrl,
      description: desc.trim() || undefined,
      category: customCat.trim() || category,
    })
    resetForm()
  }

  const allCategories = [...new Set([...categories])]
  const filtered = filter === 'todos' ? links : links.filter((l) => l.category === filter)
  const grouped = filtered.reduce((acc, l) => {
    const c = l.category || 'Outros'
    if (!acc[c]) acc[c] = []
    acc[c].push(l)
    return acc
  }, {} as Record<string, LinkItem[]>)

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <PageTitle>Links</PageTitle>
        <Btn size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Adicionar
        </Btn>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="animate-slideDown">
          <SectionLabel>Novo link</SectionLabel>
          <div className="space-y-4">
            <Input label="Título" placeholder="Ex: Curso de React - Udemy"
              value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="URL" placeholder="https://..." type="url"
              value={url} onChange={(e) => setUrl(e.target.value)} />
            <Input label="Descrição (opcional)" placeholder="Do que se trata..."
              value={desc} onChange={(e) => setDesc(e.target.value)} />

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600 font-semibold mb-2">
                Categoria
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_CATEGORIES.map((c) => (
                  <button key={c} onClick={() => { setCategory(c); setCustomCat('') }}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-150 font-medium ${
                      category === c && !customCat
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                        : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <Input placeholder="Ou crie uma categoria personalizada..."
                value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Btn onClick={submit} className="flex-1 justify-center">
                <Link size={14} /> Salvar link
              </Btn>
              <Btn variant="ghost" onClick={resetForm}>Cancelar</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Filter */}
      {allCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('todos')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-150 font-medium ${
              filter === 'todos'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                : 'text-neutral-400 dark:text-neutral-600'
            }`}>
            Todos ({links.length})
          </button>
          {allCategories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-150 font-medium ${
                filter === c
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-[#111] dark:text-[#F0F0F0]'
                  : 'text-neutral-400 dark:text-neutral-600'
              }`}>
              {c} ({links.filter((l) => l.category === c).length})
            </button>
          ))}
        </div>
      )}

      {/* Empty */}
      {links.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔗</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-600">
            Nenhum link salvo ainda.
          </p>
          <p className="text-xs text-neutral-300 dark:text-neutral-700 mt-1">
            Salve cursos, referências e ferramentas aqui.
          </p>
        </div>
      )}

      {/* Grouped links */}
      {Object.entries(grouped).map(([cat, catLinks]) => (
        <div key={cat}>
          <SectionLabel>{cat}</SectionLabel>
          <div className="space-y-2">
            {catLinks.map((l) => (
              <LinkCard key={l.id} link={l}
                isEditing={editingId === l.id}
                onStartEdit={() => setEditingId(l.id)}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={(data) => { updateLink(l.id, data); setEditingId(null) }}
                onRemove={() => removeLink(l.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function LinkCard({
  link, isEditing, onStartEdit, onCancelEdit, onSaveEdit, onRemove,
}: {
  link: LinkItem
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (data: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => void
  onRemove: () => void
}) {
  const [eTitle, setETitle] = useState(link.title)
  const [eUrl, setEUrl]     = useState(link.url)
  const [eDesc, setEDesc]   = useState(link.description ?? '')

  if (isEditing) {
    return (
      <Card className="animate-fadeIn">
        <div className="space-y-3">
          <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} label="Título" />
          <Input value={eUrl} onChange={(e) => setEUrl(e.target.value)} label="URL" />
          <Input value={eDesc} onChange={(e) => setEDesc(e.target.value)} label="Descrição" />
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => onSaveEdit({ title: eTitle, url: eUrl, description: eDesc || undefined })}>
              <Check size={12} /> Salvar
            </Btn>
            <Btn size="sm" variant="ghost" onClick={onCancelEdit}>
              <X size={12} /> Cancelar
            </Btn>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=32`}
            alt=""
            className="w-4 h-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 group">
            <span className="text-sm font-medium group-hover:underline truncate">{link.title}</span>
            <ExternalLink size={11} className="text-neutral-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {link.description && (
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5 truncate">
              {link.description}
            </p>
          )}

          <p className="text-[10px] text-neutral-300 dark:text-neutral-700 mt-1 truncate">
            {link.url.replace(/^https?:\/\//, '')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onStartEdit}
            className="text-neutral-300 dark:text-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1">
            <Pencil size={12} />
          </button>
          <button onClick={onRemove}
            className="text-neutral-300 dark:text-neutral-700 hover:text-red-400 transition-colors p-1">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Card>
  )
}
