import { useState } from 'react'
import { useTranslation }       from 'react-i18next'
import { useCategories }        from '../../hooks/useCategories'
import { useCategoryMutations } from '../../hooks/useCategoryMutations'

const PALETTE = [
  "#5B50E8", "#E8506A", "#18A882", "#E89020", "#7C3AED",
  "#0891B2", "#F06292", "#AED581", "#FFD54F", "#4DB6AC",
  "#FF8A65", "#A1C4FD", "#FD9853", "#B5EAD7", "#C7CEEA",
  "#FFDAC1", "#E2F0CB", "#FF9AA2", "#B5B9FF", "#85E3FF",
]

const PRESET_ICONS = ['📅','🏃','💼','📚','🎯','🏋️','🍽️','✈️','💡','🎵','❤️','⭐','🔔','📝','🏠']

/* ── Color Picker ──────────────────────────────────────────────────────────── */
function ColorPicker({ value, onChange, labelAuto }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      <button
        type="button"
        onClick={() => onChange(null)}
        title={labelAuto}
        style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '1.5px dashed #9ca3af', cursor: 'pointer',
          background: 'white', fontSize: 11, color: '#9ca3af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          outline: !value ? '2.5px solid #1f2937' : 'none',
          outlineOffset: 2, flexShrink: 0,
        }}
      >✦</button>
      {PALETTE.map(c => (
        <button
          key={c} type="button"
          onClick={() => onChange(value === c ? null : c)}
          title={c}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: c, flexShrink: 0,
            outline:      value === c ? `2.5px solid ${c}` : '2px solid transparent',
            outlineOffset: 2,
            transform:    value === c ? 'scale(1.25)' : 'scale(1)',
            transition:   'transform .12s',
          }}
        />
      ))}
    </div>
  )
}

/* ── Icon Picker ───────────────────────────────────────────────────────────── */
function IconPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {PRESET_ICONS.map(icon => (
        <button key={icon} type="button" onClick={() => onChange(icon === value ? '' : icon)} style={{
          width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
          fontSize: 16,
          background: value === icon ? '#f1f5f9' : '#f9fafb',
          outline: value === icon ? '2px solid #1f2937' : 'none',
          transition: 'background .1s',
        }}>{icon}</button>
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

  const previewColor = color ?? '#6b7280'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), ...(color ? { color } : {}), icon: icon || null })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: previewColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {icon || '📅'}
        </span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{name || t('categories.newTitle')}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
            {color ? color : t('categories.autoColor')}
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label style={labelStyle}>{t('categories.fields.name')}</label>
        <input
          required autoFocus
          value={name} onChange={e => setName(e.target.value)}
          placeholder={t('categories.namePlaceholder')}
          style={inputStyle}
        />
      </div>

      {/* Color */}
      <div>
        <label style={labelStyle}>
          {t('categories.fields.color')}
          <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, color: '#9ca3af' }}>
            {t('categories.autoColorHint')}
          </span>
        </label>
        <ColorPicker value={color} onChange={setColor} labelAuto={t('categories.autoColor')} />
      </div>

      {/* Icono */}
      <div>
        <label style={labelStyle}>{t('categories.fields.iconOptional')}</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={cancelBtnStyle}>{t('categories.actions.cancel')}</button>
        <button type="submit" disabled={loading} style={saveBtnStyle}>
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
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid #f0f0f0', background: 'white', transition: 'box-shadow .15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <span style={{ width: 32, height: 32, borderRadius: 8, background: category.color ?? '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
        {category.icon || '📅'}
      </span>

      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{category.name}</span>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 20, background: (category.color ?? '#6b7280') + '20', fontSize: 11, color: category.color ?? '#6b7280', fontWeight: 500 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: category.color ?? '#6b7280', display: 'inline-block' }} />
        {category.color ?? '—'}
      </span>

      {confirmDelete ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#ef4444' }}>{t('categories.confirmDelete')}</span>
          <button onClick={() => onDelete(category.id)} className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
            {t('categories.confirmYes')}
          </button>
          <button onClick={() => setConfirmDelete(false)} className="px-2 py-0.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            {t('categories.confirmNo')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onEdit(category)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title={t('categories.edit')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title={t('categories.delete')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

  if (isLoading) return <div style={{ padding: 24, color: '#9ca3af', fontSize: 13 }}>{t('categories.loading')}</div>

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{t('categories.title')}</h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{t('categories.subtitle')}</p>
        </div>
        {mode === 'list' && (
          <button onClick={() => setMode('create')} style={saveBtnStyle}>+ {t('categories.new')}</button>
        )}
      </div>

      {mode === 'create' && (
        <div style={formWrapStyle}>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{t('categories.newTitle')}</p>
          <CategoryForm onSave={handleCreate} onCancel={() => setMode('list')} loading={create.isPending} />
        </div>
      )}

      {mode === 'edit' && editing && (
        <div style={formWrapStyle}>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{t('categories.editTitle')}</p>
          <CategoryForm initial={editing} onSave={handleUpdate} onCancel={() => { setMode('list'); setEditing(null) }} loading={update.isPending} />
        </div>
      )}

      {categories.length === 0 && mode === 'list' ? (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 28 }}>🏷️</span>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>
            {t('categories.empty')}<br />{t('categories.emptyHint')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map(cat => (
            <CategoryRow key={cat.id} category={cat} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle     = { display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }
const inputStyle     = { width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', background: 'white' }
const saveBtnStyle   = { padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: '#1f2937', color: 'white' }
const cancelBtnStyle = { padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: 'white', color: '#374151' }
const smallBtn       = { padding: '3px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 12 }
const formWrapStyle  = { padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fafafa', marginBottom: 16 }