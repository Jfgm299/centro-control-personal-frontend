import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarStore }     from './store/calendarStore'
import { useReminderMutations } from './hooks/useReminderMutations'
import CalendarView      from './components/calendar/CalendarView'
import EventModal        from './components/calendar/EventModal'
import ReminderPanel     from './components/reminders/ReminderPanel'
import RoutinesList      from './components/routines/RoutinesList'
import CategoriesManager from './components/categories/CategoriesManager'
import IntegrationsManager from './components/integrations/IntegrationsManager'
import { motion } from 'framer-motion'

const TABS = [
  { key: 'calendar',     icon: '📅' },
  { key: 'routines',     icon: '🔁' },
  { key: 'categories',   icon: '🏷️' },
  { key: 'integrations', icon: '🔗' },
]

function MenuIcon({ open }) {
  return open ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export default function CalendarPageMobile() {
  const { t } = useTranslation('calendar')
  const [tab, setTab]             = useState('calendar')
  const [panelOpen, setPanelOpen] = useState(false)

  // Reminder pendiente de colocación (tap-to-place)
  const [pendingReminder, setPendingReminder] = useState(null) // { id, title }

  const { eventModalOpen, eventModalData, openEventModal, closeEventModal } = useCalendarStore()
  const { schedule } = useReminderMutations()

  const handleEventClick = useCallback((event) => {
    openEventModal(event)
  }, [openEventModal])

  // Si hay reminder pendiente, un tap en un slot lo coloca ahí en vez de abrir el modal
  const handleSlotSelect = useCallback(async ({ start, end, allDay }) => {
    if (pendingReminder) {
      await schedule.mutateAsync({
        id:       pendingReminder.id,
        start_at: start.toISOString(),
        end_at:   end.toISOString(),
      })
      setPendingReminder(null)
      return
    }
    openEventModal({ start_at: start, end_at: end, all_day: allDay })
  }, [pendingReminder, schedule, openEventModal])

  // Llamado por el ReminderPanel cuando el usuario toca un reminder en móvil
  const handleReminderTap = useCallback((reminder) => {
    setPendingReminder({ id: reminder.id, title: reminder.title })
    setPanelOpen(false)  // cerrar panel para dejar visible el calendario
  }, [])

  const handleExternalDrop = useCallback(async (reminderId, start, end, allDay) => {
    await schedule.mutateAsync({ id: reminderId, start_at: start.toISOString(), end_at: end.toISOString() })
  }, [schedule])

  return (
    <div className="flex flex-col h-full text-white relative overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 sticky top-0 z-10 flex-shrink-0">
        <span className="text-xl font-bold text-white">{t('title')}</span>
        <div className="flex gap-1 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/5 shadow-inner">
          {TABS.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="relative w-9 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
            >
              {tab === key && (
                <motion.div
                  layoutId="active-tab-calendar-mobile"
                  className="absolute inset-0 bg-white/10 rounded-full shadow-sm border border-white/10"
                />
              )}
              <span className="relative z-10 text-base">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Banner tap-to-place ── */}
      {pendingReminder && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-4 py-3 bg-indigo-500 text-white text-sm font-semibold flex-shrink-0 shadow-lg z-20"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase opacity-70 tracking-widest">{t('reminders.tapToPlace')}</p>
              <p className="font-black truncate max-w-[200px]">{pendingReminder.title}</p>
            </div>
          </div>
          <button
            onClick={() => setPendingReminder(null)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all active:scale-95 border border-white/20"
          >
            {t('common.cancel')}
          </button>
        </motion.div>
      )}

      {/* ── Contenido ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden">

        {/* Calendario */}
        <div className={`h-full px-2 ${tab === 'calendar' ? 'block' : 'hidden'}`}>
          <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden relative">
            <CalendarView
              onEventClick={handleEventClick}
              onSlotSelect={handleSlotSelect}
              onExternalDrop={handleExternalDrop}
              style={pendingReminder ? { cursor: 'crosshair' } : undefined}
            />
          </div>
        </div>

        {/* Rutinas */}
        {tab === 'routines' && (
          <div className="h-full overflow-y-auto px-4 pb-32">
            <RoutinesList />
          </div>
        )}

        {/* Categorías */}
        {tab === 'categories' && (
          <div className="h-full overflow-y-auto px-4 pb-32">
            <CategoriesManager />
          </div>
        )}

        {/* Integraciones */}
        {tab === 'integrations' && (
          <div className="h-full overflow-y-auto px-4 pb-32">
            <IntegrationsManager />
          </div>
        )}

        {/* Overlay oscuro */}
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
          />
        )}

        {/* Panel de recordatorios (slide desde la izquierda) */}
        <motion.div
          animate={{ x: panelOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 left-0 bottom-0 w-72 z-40 bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl overflow-y-auto"
        >
          <ReminderPanel onReminderTap={handleReminderTap} />
        </motion.div>
      </div>

      {/* Botón flotante para abrir panel lateral */}
      {tab === 'calendar' && (
        <button
          onClick={() => setPanelOpen(o => !o)}
          className={`absolute top-[68px] right-4 z-20 w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90 shadow-lg
            ${panelOpen 
              ? 'bg-white text-slate-900 border-white rotate-0' 
              : 'bg-white/10 text-white border-white/20 backdrop-blur-md'}`}
        >
          <MenuIcon open={panelOpen} />
        </button>
      )}

      <EventModal isOpen={eventModalOpen} onClose={closeEventModal} initialData={eventModalData} />
    </div>
  )
}