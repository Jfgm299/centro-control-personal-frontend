import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarStore }     from './store/calendarStore'
import { useReminderMutations } from './hooks/useReminderMutations'
import CalendarView      from './components/calendar/CalendarView'
import EventModal        from './components/calendar/EventModal'
import ReminderPanel     from './components/reminders/ReminderPanel'
import RoutinesList      from './components/routines/RoutinesList'
import CategoriesManager from './components/categories/CategoriesManager'

const TABS = [
  { key: 'calendar',   label: '📅 Calendario' },
  { key: 'routines',   label: '🔁 Rutinas'    },
  { key: 'categories', label: '🏷️ Categorías' },
]

export default function CalendarPageDesktop() {
  const [tab, setTab] = useState('calendar')

  const { eventModalOpen, eventModalData, openEventModal, closeEventModal } = useCalendarStore()
  const { schedule } = useReminderMutations()

  const handleSlotSelect = useCallback(({ start, end, allDay }) => {
    openEventModal({ start_at: start, end_at: end, all_day: allDay })
  }, [openEventModal])

  const handleEventClick = useCallback((event) => {
    openEventModal(event)
  }, [openEventModal])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('reminderId')
    if (!id) return
    const now = new Date(); now.setMinutes(0, 0, 0)
    const end = new Date(now.getTime() + 3600000)
    await schedule.mutateAsync({ id: Number(id), start_at: now.toISOString(), end_at: end.toISOString() })
  }, [schedule])

  return (
    <div style={{
      margin: '-32px',
      height: 'calc(100vh - 52px)',
      display: 'flex', flexDirection: 'column',
      background: 'white',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', height: 48,
        borderBottom: '1px solid #f0f0f0', flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Planner</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 500,
              background: tab === key ? '#f3f4f6' : 'transparent',
              color:      tab === key ? '#111827' : '#6b7280',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* Calendario */}
        {tab === 'calendar' && (
          <>
            <ReminderPanel />
            <div
              style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 16px 0' }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <CalendarView onEventClick={handleEventClick} onSlotSelect={handleSlotSelect} />
            </div>
          </>
        )}

        {/* Rutinas */}
        {tab === 'routines' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <RoutinesList />
          </div>
        )}

        {/* Categorías */}
        {tab === 'categories' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <CategoriesManager />
          </div>
        )}
      </div>

      <EventModal isOpen={eventModalOpen} onClose={closeEventModal} initialData={eventModalData} />
    </div>
  )
}