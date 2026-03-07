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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 8px', flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{t('title')}</span>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, gap: 2 }}>
          {TABS.map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              width: 36, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 14,
              background: tab === key ? 'white' : 'transparent',
              boxShadow:  tab === key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              transition: 'background .15s',
            }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* ── Banner tap-to-place ── */}
      {pendingReminder && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#111827', color: 'white',
          fontSize: 12.5, fontWeight: 500,
          flexShrink: 0,
          animation: 'slideDown .2s ease',
        }}>
          <span>📍 {t('reminders.tapToPlace', 'Toca un slot para colocar')}:<br />
            <span style={{ fontWeight: 700 }}>{pendingReminder.title}</span>
          </span>
          <button
            onClick={() => setPendingReminder(null)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
          >
            {t('common.cancel', 'Cancelar')}
          </button>
        </div>
      )}

      {/* ── Contenido ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>

        {/* Calendario */}
        <div style={{ display: tab === 'calendar' ? 'block' : 'none', height: '100%', padding: '0 8px' }}>
          <CalendarView
            onEventClick={handleEventClick}
            onSlotSelect={handleSlotSelect}
            onExternalDrop={handleExternalDrop}
            // Cursor especial cuando hay reminder pendiente
            style={pendingReminder ? { cursor: 'crosshair' } : undefined}
          />
        </div>

        {/* Rutinas */}
        {tab === 'routines' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>
            <RoutinesList />
          </div>
        )}

        {/* Categorías */}
        {tab === 'categories' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>
            <CategoriesManager />
          </div>
        )}

        {/* Integraciones */}
        {tab === 'integrations' && (
          <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>
            <IntegrationsManager />
          </div>
        )}

        {/* Overlay oscuro */}
        {panelOpen && (
          <div
            onClick={() => setPanelOpen(false)}
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              background: 'rgba(0,0,0,0.25)',
              animation: 'fadeIn .2s ease',
            }}
          />
        )}

        {/* Panel de recordatorios (slide desde la izquierda) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: 260, zIndex: 40,
          background: 'white',
          boxShadow: panelOpen ? '4px 0 24px rgba(0,0,0,.12)' : 'none',
          transform: panelOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
          overflowY: 'auto',
        }}>
          {/* Pasamos onReminderTap para que los items sean tapeables en móvil */}
          <ReminderPanel onReminderTap={handleReminderTap} />
        </div>
      </div>

      {/* Botón flotante (solo en tab calendario) */}
      {tab === 'calendar' && (
        <button
          onClick={() => setPanelOpen(o => !o)}
          style={{
            position: 'absolute',
            top: 96, left: 16,
            zIndex: 50,
            width: 36, height: 36,
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: panelOpen ? '#111827' : 'white',
            color:      panelOpen ? 'white'   : '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,.10)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s, color .15s',
          }}
        >
          <MenuIcon open={panelOpen} />
        </button>
      )}

      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDown { from { transform: translateY(-100%) } to { transform: translateY(0) } }
      `}</style>

      <EventModal isOpen={eventModalOpen} onClose={closeEventModal} initialData={eventModalData} />
    </div>
  )
}