import { useState } from 'react'
import { useTranslation }       from 'react-i18next'
import { useCategories }        from '../../hooks/useCategories'
import { useCategoryMutations } from '../../hooks/useCategoryMutations'
import clsx from 'clsx'

const PALETTE = [
  "#818cf8", "#f87171", "#34d399", "#fbbf24", "#c084fc",
  "#22d3ee", "#f472b6", "#a3e635", "#fb923c", "#2dd4bf",
  "#94a3b8", "#60a5fa", "#fca5a5", "#99f6e4", "#d8b4fe",
  "#fed7aa", "#d9f99d", "#fecaca", "#c7d2fe", "#a5f3fc",
]

const PRESET_ICONS = ['📅','🏃','💼','📚','🎯','🏋️','🍽️','✈️','💡','🎵','❤️','⭐','🔔','📝','🏠']

/* ── Color Picker ──────────────────────────────────────────────────────────── */
function ColorPicker({ value, onChange, labelAuto }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={() => onChange(null)}
        title={labelAuto}
        className={clsx(
          "w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-xs transition-all",
          !value ? "border-white text-white bg-white/10 scale-110" : "border-white/20 text-white/30 hover:border-white/40"
        )}
      >✦</button>
      {PALETTE.map(c => (
        <button
          key={c} type="button"
          onClick={() => onChange(value === c ? null : c)}
          title={c}
          className={clsx(
            "w-7 h-7 rounded-full transition-all duration-200",
            value === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-lg" : "hover:scale-110 opacity-80 hover:opacity-100"
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  )
}

/* ── Icon Picker ───────────────────────────────────────────────────────────── */
function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_ICONS.map(icon => (
        <button key={icon} type="button" onClick={() => onChange(icon === value ? '' : icon)} 
          className={clsx(
            "w-9 h-9 flex items-center justify-center rounded-xl transition-all text-xl",
            value === icon ? "bg-white/20 border border-white/30 shadow-inner scale-110" : "bg-black/20 border border-white/5 hover:bg-white/10"
          )}
        >{icon}</button>
      ))}
    </div>
  )
}

/* ── Category Form ─────────────────────────────────────────────────────────── */
function CategoryForm({ initial, onSave, onCancel, loading }) {
  const { t } = useTranslation('calendar')
  const [name,  setName]  = useState(initial?.name  ?? '')
  const [color, setColor] = useState(initial?.color ?? null)
  const [icon,  setIcon]  = useState(initial?.icon  ?? '')

  const previewColor = color ?? '#94a3b8'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), ...(color ? { color } : {}), icon: icon || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Preview Card */}
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{ background: previewColor }}>
          {icon || '📅'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-black text-white truncate">{name || t('categories.newTitle')}</div>
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5 font-mono">
            {color ? color : t('categories.autoColor')}
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('categories.fields.name')}</label>
        <input
          required autoFocus
          value={name} onChange={e => setName(e.target.value)}
          placeholder={t('categories.namePlaceholder')}
          className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-between">
          {t('categories.fields.color')}
          <span className="font-bold text-[9px] text-white/20 normal-case italic">
            {t('categories.autoColorHint')}
          </span>
        </label>
        <ColorPicker value={color} onChange={setColor} labelAuto={t('categories.autoColor')} />
      </div>

      {/* Icono */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('categories.fields.iconOptional')}</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-white/50 hover:text-white transition-all">
          {t('categories.actions.cancel')}
        </button>
        <button type="submit" disabled={loading} 
          className="px-6 py-2.5 bg-white/10 text-white text-sm font-black uppercase tracking-wider rounded-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg">
          {loading ? t('categories.actions.saving') : initial ? t('categories.actions.save') : t('categories.actions.create')}
        </button>
      </div>
    </form>
  )
}

/* ── Category Row ──────────────────────────────────────────────────────────── */
function CategoryRow({ category, onEdit, onDelete }) {
  const { t } = useTranslation('calendar')
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 group"
    >
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md shrink-0" style={{ background: category.color ?? '#94a3b8' }}>
        {category.icon || '📅'}
      </span>

      <span className="flex-1 text-sm font-black text-white">{category.name}</span>

      <span className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 text-[10px] font-bold text-white/50 border border-white/5 font-mono">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: category.color ?? '#94a3b8' }} />
        {category.color ?? 'AUTO'}
      </span>

      {confirmDelete ? (
        <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-xl border border-red-500/20 shadow-inner animate-in fade-in zoom-in duration-200">
          <button onClick={() => onDelete(category.id)} className="px-3 py-1 text-[10px] font-black uppercase bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md">
            OK
          </button>
          <button onClick={() => setConfirmDelete(false)} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-all">✕</button>
        </div>
      ) : (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
            title={t('categories.edit')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
            title={t('categories.delete')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

/* ── CategoriesManager ─────────────────────────────────────────────────────── */
export default function CategoriesManager() {
  const { t } = useTranslation('calendar')
  const { data: categories = [], isLoading } = useCategories()
  const { create, update, remove }           = useCategoryMutations()
  const [mode,    setMode]    = useState('list')
  const [editing, setEditing] = useState(null)

  const handleCreate = async (payload) => { await create.mutateAsync(payload); setMode('list') }
  const handleUpdate = async (payload) => { await update.mutateAsync({ id: editing.id, ...payload }); setMode('list'); setEditing(null) }
  const handleDelete = async (id)      => { await remove.mutateAsync(id) }
  const handleEdit   = (cat)           => { setEditing(cat); setMode('edit') }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-white/30">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white">{t('categories.title')}</h3>
          <p className="text-xs font-medium text-white/40 mt-1">{t('categories.subtitle')}</p>
        </div>
        {mode === 'list' && (
          <button 
            onClick={() => setMode('create')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg"
          >
            + {t('categories.new')}
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        {mode === 'create' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">{t('categories.newTitle')}</p>
            <CategoryForm onSave={handleCreate} onCancel={() => setMode('list')} loading={create.isPending} />
          </div>
        )}

        {mode === 'edit' && editing && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">{t('categories.editTitle')}</p>
            <CategoryForm initial={editing} onSave={handleUpdate} onCancel={() => { setMode('list'); setEditing(null) }} loading={update.isPending} />
          </div>
        )}

        {categories.length === 0 && mode === 'list' ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-5xl drop-shadow-xl opacity-30 italic">🏷️</span>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              {t('categories.empty')}<br />
              <span className="text-xs opacity-60 italic">{t('categories.emptyHint')}</span>
            </p>
          </div>
        ) : mode === 'list' ? (
          <div className="flex flex-col gap-2.5">
            {categories.map(cat => (
              <CategoryRow key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}