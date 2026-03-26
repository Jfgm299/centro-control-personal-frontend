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
import clsx from 'clsx'

/* ─── SectionTitle ─────────────────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <div className="text-[10px] font-black text-white/60 tracking-[0.1em] uppercase px-3 pt-6 pb-2">
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
  const color   = category?.color ?? '#94a3b8'

  return (
    <div className="mb-1">
      {/* Header del grupo */}
      <div className="flex items-center px-3 py-2 gap-2 group/header">
        {/* Flecha collapse */}
        <button onClick={() => setOpen(o => !o)} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-white/5 transition-all active:scale-90">
          <span className={clsx(
            "text-[8px] text-white/30 transition-transform duration-200",
            open ? "rotate-90" : "rotate-0"
          )}>▶</span>
        </button>

        {/* Color + nombre */}
        <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
        <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex-1 truncate">
          {category
            ? (category.icon ? `${category.icon} ${category.name}` : category.name)
            : t('reminders.uncategorized')}
        </span>

        {/* Ojo — solo si tiene category_id real */}
        {catId !== null && (
          <button
            onClick={() => toggleCategoryVisibility(catId)}
            title={visible ? t('categories.filter.hide') : t('categories.filter.show')}
            className={clsx(
              "w-6 h-6 flex items-center justify-center rounded-lg transition-all active:scale-90",
              visible ? "text-white/40 hover:text-white hover:bg-white/10" : "text-white/20 hover:text-white/40"
            )}
          >
            {visible
              ? (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>)
              : (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>)}
          </button>
        )}
      </div>

      {/* Items */}
      {open && (
        <div className="flex flex-col gap-1 px-1">
          {items.map(r => (
            <ReminderCard key={r.id} reminder={r} color={color} onTap={onTap} />
          ))}
        </div>
      )}
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
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden w-full">

      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <span className="text-sm font-black text-white drop-shadow-md uppercase tracking-widest">{t('reminders.title')}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSearch(s => !s)}
            className={clsx(
              "w-8 h-8 flex items-center justify-center rounded-xl transition-all active:scale-90 border",
              search ? "bg-white/20 text-white border-white/30" : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
            )}
          >🔍</button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white text-[11px] font-black uppercase tracking-wider rounded-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-sm"
          >
            {t('reminders.add')}
          </button>
        </div>
      </div>

      {/* Search input */}
      {search && (
        <div className="px-4 pb-4">
          <input
            autoFocus
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={t('reminders.searchPlaceholder')}
            className="w-full px-4 py-2.5 text-xs bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all shadow-inner"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {filtered ? (
          /* ── Resultados búsqueda ── */
          <div className="flex flex-col gap-1 px-1">
            {filtered.length === 0
              ? <div className="p-8 text-center text-xs text-white/30 italic font-medium">{t('reminders.noResults')}</div>
              : filtered.map(r => {
                  const cat = categories.find(c => c.id === r.category_id)
                  return <ReminderCard key={r.id} reminder={r} color={cat?.color} onTap={onReminderTap} />
                })}
          </div>
        ) : (
          <>
            {/* ── 1. ALTA PRIORIDAD (sin asignar) ── */}
            {highPriority.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.highPriority')}</SectionTitle>
                <div className="flex flex-col gap-1 px-1">
                  {highPriority.map(r => (
                    <ReminderCard key={r.id} reminder={r} onTap={onReminderTap} />
                  ))}
                </div>
                <div className="h-px bg-white/5 mx-4 my-4" />
              </>
            )}

            {/* ── 2. ASIGNADOS — agrupados por categoría con ojo ── */}
            {scheduledByCategory.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.scheduled')}</SectionTitle>
                <div className="flex flex-col gap-2">
                  {scheduledByCategory.map(({ category, items }) => (
                    <ScheduledCategoryGroup
                      key={category?.id ?? 'none'}
                      category={category}
                      items={items}
                      onTap={onReminderTap}
                    />
                  ))}
                </div>
                <div className="h-px bg-white/5 mx-4 my-4" />
              </>
            )}

            {/* ── 3. BACKLOG — sin asignar, por categoría ── */}
            {othersByCategory.length > 0 && (
              <>
                <SectionTitle>{t('reminders.sections.unassigned')}</SectionTitle>
                <div className="flex flex-col gap-3">
                  {othersByCategory.map(({ category, items }) => {
                    const color = category?.color ?? '#94a3b8'
                    return (
                      <div key={category?.id ?? 'none'}>
                        {othersByCategory.length > 1 && (
                          <div className="flex items-center gap-2 px-4 py-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate">
                              {category
                                ? (category.icon ? `${category.icon} ${category.name}` : category.name)
                                : t('reminders.uncategorized')}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1 px-1">
                          {items.map(r => (
                            <ReminderCard key={r.id} reminder={r} color={color} onTap={onReminderTap} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── Empty state ── */}
            {reminders.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <span className="text-4xl drop-shadow-lg opacity-50">✅</span>
                <span className="text-xs text-white/40 text-center font-medium leading-relaxed italic">{t('reminders.empty')}</span>
              </div>
            )}
          </>
        )}

        <div className="mt-8 border-t border-white/5 pt-4">
          <CategoryFilter />
          <div className="h-4" />
          <RoutineFilter />
        </div>
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