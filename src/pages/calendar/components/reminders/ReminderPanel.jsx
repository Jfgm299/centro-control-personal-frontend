import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useReminders }             from '../../hooks/useReminders'
import { useCategories }            from '../../hooks/useCategories'
import { useScheduledReminderIds }  from '../../hooks/useScheduledReminderIds'
import { useCalendarStore }         from '../../store/calendarStore'
import CreateReminderModal          from './CreateReminderModal'
import CategoryFilter               from '../categories/CategoryFilter'
import RoutineFilter                from '../routines/RoutineFilter'
import ReminderCard                 from './ReminderCard'

/* ─── SectionTitle ─────────────────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: '#9ca3af',
      letterSpacing: '.07em', textTransform: 'uppercase',
      padding: '10px 12px 4px',
    }}>
      {children}
    </div>
  )
}

/* ─── Collapsible category group (para recordatorios asignados) ─────────────── */
function ScheduledCategoryGroup({ category, items, onTap }) {
  const { t } = useTranslation('calendar')
  const [open, setOpen] = useState(true)
  const { hiddenCategoryIds, toggleCategoryVisibility } = useCalendarStore()
  const catId   = category?.id ?? null
  const visible = catId !== null ? !hiddenCategoryIds.has(catId) : true
  const color   = category?.color ?? '#9ca3af'

  return (
    <div>
      {/* Header del grupo */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 4px', gap: 6 }}>
        {/* Flecha collapse */}
        <button onClick={() => setOpen(o => !o)} style={iconBtn}>
          <span style={{
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform .15s',
            fontSize: 10, color: '#9ca3af',
          }}>▶</span>
        </button>

        {/* Color + nombre */}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#6b7280',
          letterSpacing: '.05em', textTransform: 'uppercase',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {category
            ? (category.icon ? `${category.icon} ${category.name}` : category.name)
            : t('reminders.uncategorized')}
        </span>

        {/* Ojo — solo si tiene category_id real */}
        {catId !== null && (
          <button
            onClick={() => toggleCategoryVisibility(catId)}
            title={visible ? t('categories.filter.hide') : t('categories.filter.show')}
            style={{ ...iconBtn, color: visible ? '#6b7280' : '#d1d5db' }}
          >
            {visible
              ? (<svg style={{ width: 13, height: 13, display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>)
              : (<svg style={{ width: 13, height: 13, display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>)}
          </button>
        )}
      </div>

      {/* Items */}
      {open && items.map(r => (
        <ReminderCard key={r.id} reminder={r} color={color} onTap={onTap} />
      ))}
    </div>
  )
}

/* ─── ReminderPanel ────────────────────────────────────────────────────────── */
export default function ReminderPanel({ onReminderTap }) {
  const { t } = useTranslation('calendar')
  const { data: reminders  = [] }          = useReminders()
  const { data: categories = [] }          = useCategories()
  const { data: scheduledIds = new Set() } = useScheduledReminderIds()
  const [search, setSearch]                = useState(false)
  const [searchText, setSearchText]        = useState('')
  const [createOpen, setCreateOpen]        = useState(false)

  /* Separar scheduled vs unscheduled */
  const scheduled   = useMemo(() => reminders.filter(r =>  scheduledIds.has(r.id)), [reminders, scheduledIds])
  const unscheduled = useMemo(() => reminders.filter(r => !scheduledIds.has(r.id)), [reminders, scheduledIds])

  /* Unscheduled: alta prioridad por un lado, resto por otro */
  const highPriority = unscheduled.filter(r => r.priority === 'high' || r.priority === 'urgent')
  const others       = unscheduled.filter(r => r.priority !== 'high' && r.priority !== 'urgent')

  /* Agrupar "others" por categoría */
  const othersByCategory = useMemo(() => {
    const map = new Map()
    categories.forEach(c => map.set(c.id, { category: c, items: [] }))
    map.set(null, { category: null, items: [] })
    others.forEach(r => {
      const key = r.category_id ?? null
      if (!map.has(key)) map.set(key, { category: null, items: [] })
      map.get(key).items.push(r)
    })
    return [...map.values()].filter(g => g.items.length > 0)
  }, [others, categories])

  /* Agrupar scheduled por categoría */
  const scheduledByCategory = useMemo(() => {
    const map = new Map()
    categories.forEach(c => map.set(c.id, { category: c, items: [] }))
    map.set(null, { category: null, items: [] })
    scheduled.forEach(r => {
      const key = r.category_id ?? null
      if (!map.has(key)) map.set(key, { category: null, items: [] })
      map.get(key).items.push(r)
    })
    return [...map.values()].filter(g => g.items.length > 0)
  }, [scheduled, categories])

  /* Búsqueda */
  const filtered = searchText
    ? reminders.filter(r => r.title.toLowerCase().includes(searchText.toLowerCase()))
    : null

  return (
    <div style={{
      width: 220, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'white', borderRight: '1px solid #f0f0f0',
      height: '100%', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 8px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t('reminders.title')}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setSearch(s => !s)}
            style={{ ...iconBtn, color: search ? '#6366f1' : '#9ca3af', fontSize: 13 }}
          >🔍</button>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '3px 8px', borderRadius: 6,
              border: '1px solid #e5e7eb', background: 'white',
              fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer',
            }}
          >
            {t('reminders.add')}
          </button>
        </div>
      </div>

      {/* Search input */}
      {search && (
        <div style={{ padding: '0 10px 8px' }}>
          <input
            autoFocus
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={t('reminders.searchPlaceholder')}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '5px 10px', borderRadius: 7,
              border: '1px solid #e5e7eb', fontSize: 12,
              color: '#374151', outline: 'none', background: '#f9fafb',
            }}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered ? (
          /* ── Resultados búsqueda ── */
          filtered.length === 0
            ? <div style={{ padding: '20px 12px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{t('reminders.noResults')}</div>
            : filtered.map(r => {
                const cat = categories.find(c => c.id === r.category_id)
                return <ReminderCard key={r.id} reminder={r} color={cat?.color} onTap={onReminderTap} />
              })
        ) : (
          <>
            {/* ── 1. ALTA PRIORIDAD (sin asignar) ── */}
            {highPriority.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.highPriority')}</SectionTitle>
                {highPriority.map(r => (
                  <ReminderCard key={r.id} reminder={r} onTap={onReminderTap} />
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '6px 12px' }} />
              </>
            )}

            {/* ── 2. ASIGNADOS — agrupados por categoría con ojo ── */}
            {scheduledByCategory.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.scheduled')}</SectionTitle>
                {scheduledByCategory.map(({ category, items }) => (
                  <ScheduledCategoryGroup
                    key={category?.id ?? 'none'}
                    category={category}
                    items={items}
                    onTap={onReminderTap}
                  />
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '6px 12px' }} />
              </>
            )}

            {/* ── 3. BACKLOG — sin asignar, por categoría ── */}
            {othersByCategory.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.unassigned')}</SectionTitle>
                {othersByCategory.map(({ category, items }) => {
                  const color = category?.color ?? '#9ca3af'
                  return (
                    <div key={category?.id ?? 'none'}>
                      {othersByCategory.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 2px' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            {category
                              ? (category.icon ? `${category.icon} ${category.name}` : category.name)
                              : t('reminders.uncategorized')}
                          </span>
                        </div>
                      )}
                      {items.map(r => (
                        <ReminderCard key={r.id} reminder={r} color={color} onTap={onReminderTap} />
                      ))}
                    </div>
                  )
                })}
              </>
            )}

            {/* ── Empty state ── */}
            {reminders.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 12px', gap: 8 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <span style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{t('reminders.empty')}</span>
              </div>
            )}
          </>
        )}

        {/* Categorías y Rutinas */}
        <CategoryFilter />
        <RoutineFilter />
      </div>

      <CreateReminderModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

const iconBtn = {
  width: 24, height: 24, borderRadius: 5, border: 'none',
  background: 'transparent', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, fontSize: 12,
}