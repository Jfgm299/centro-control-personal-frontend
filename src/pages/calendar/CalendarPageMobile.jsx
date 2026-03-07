import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarStore }     from './store/calendarStore'
import { useReminderMutations } from './hooks/useReminderMutations'
import CalendarView  from './components/calendar/CalendarView'
import EventModal    from './components/calendar/EventModal'
import ReminderPanel from './components/reminders/ReminderPanel'
import RoutinesList  from './components/routines/RoutinesList'

const TABS = ['calendar', 'reminders', 'routines']

export default function CalendarPageMobile() {
  const { t } = useTranslation('calendar')
  const [tab, setTab] = useState('calendar')

  const { eventModalOpen, eventModalData, openEventModal, closeEventModal } = useCalendarStore()
  const { schedule } = useReminderMutations()

  const handleSlotSelect = useCallback(({ start, end, allDay }) => {
    openEventModal({ start_at: start, end_at: end, all_day: allDay })
  }, [openEventModal])

  const handleEventClick = useCallback((event) => {
    openEventModal(event)
  }, [openEventModal])

  return (
    <div className="flex flex-col h-full">
      {/* Header compacto */}
      <div className="px-4 pt-2 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('title')}</h1>
      </div>

      {/* Tabs mobile */}
      <div className="flex gap-1 mx-4 bg-gray-100 rounded-xl p-1 mb-3">
        {TABS.map((key) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400'}`}>
            {key === 'calendar' ? '📅' : key === 'reminders' ? '📋' : '🔁'}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-h-0 px-4">
        {tab === 'calendar' && (
          <CalendarView
            onEventClick={handleEventClick}
            onSlotSelect={handleSlotSelect}
          />
        )}
        {tab === 'reminders' && (
          <div className="h-full overflow-y-auto">
            {/* En móvil el panel ocupa toda la pantalla */}
            <ReminderPanel />
          </div>
        )}
        {tab === 'routines' && (
          <div className="h-full overflow-y-auto">
            <RoutinesList />
          </div>
        )}
      </div>

      <EventModal
        isOpen={eventModalOpen}
        onClose={closeEventModal}
        initialData={eventModalData}
      />
    </div>
  )
}