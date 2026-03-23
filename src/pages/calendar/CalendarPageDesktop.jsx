import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarStore }     from './store/calendarStore'
import { useReminderMutations } from './hooks/useReminderMutations'
import CalendarView      from './components/calendar/CalendarView'
import EventModal        from './components/calendar/EventModal'
import ReminderPanel     from './components/reminders/ReminderPanel'
import RoutinesList      from './components/routines/RoutinesList'
import CategoriesManager from './components/categories/CategoriesManager'
import IntegrationsManager from './components/integrations/IntegrationsManager'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function CalendarPageDesktop() {
  const { t } = useTranslation('calendar')
  const [tab, setTab] = useState('calendar')

  const TABS = [
    { key: 'calendar',     label: t('tabs.calendar'), icon: '📅' },
    { key: 'routines',     label: t('tabs.routines'), icon: '🔁' },
    { key: 'categories',   label: t('tabs.categories'), icon: '🏷️' },
    { key: 'integrations', label: t('tabs.integrations'), icon: '🔗' },
  ]

  const { eventModalOpen, eventModalData, openEventModal, closeEventModal } = useCalendarStore()
  const { schedule } = useReminderMutations()

  const handleSlotSelect = useCallback(({ start, end, allDay }) => {
    openEventModal({ start_at: start, end_at: end, all_day: allDay })
  }, [openEventModal])

  const handleEventClick = useCallback((event) => {
    openEventModal(event)
  }, [openEventModal])

  const handleExternalDrop = useCallback(async (reminderId, start, end, allDay) => {
    await schedule.mutateAsync({
      id:       reminderId,
      start_at: start.toISOString(),
      end_at:   end.toISOString(),
    })
  }, [schedule])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('reminderId')
    if (!id) return

    let slotTime = null
    let el = document.elementFromPoint(e.clientX, e.clientY)
    while (el && el !== document.body) {
      if (el.dataset?.time) { slotTime = el.dataset.time; break }
      el = el.parentElement
    }

    let slotDate = null
    const dayHeaders = document.querySelectorAll('[data-date]')
    for (const header of dayHeaders) {
      const rect = header.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        slotDate = header.dataset.date
        break
      }
    }

    let start
    if (slotDate && slotTime) {
      const [h, m] = slotTime.split(':').map(Number)
      start = new Date(`${slotDate}T00:00:00`)
      start.setHours(h, m, 0, 0)
    } else if (slotTime) {
      const [h, m] = slotTime.split(':').map(Number)
      start = new Date()
      start.setHours(h, m, 0, 0)
    } else {
      start = new Date()
      start.setMinutes(0, 0, 0)
    }
    const end = new Date(start.getTime() + 3600000)
    await schedule.mutateAsync({ id: Number(id), start_at: start.toISOString(), end_at: end.toISOString() })
  }, [schedule])

  return (
    <div className="flex flex-col h-full text-white overflow-hidden max-w-full">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Planner</h1>
          <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 shadow-inner">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={clsx(
                  'px-4 py-1.5 text-sm font-semibold rounded-full transition-all relative whitespace-nowrap',
                  tab === key ? 'text-white' : 'text-white/50 hover:text-white'
                )}
              >
                {tab === key && (
                  <motion.div
                    layoutId="active-tab-calendar-desktop"
                    className="absolute inset-0 bg-white/10 rounded-full shadow-md border border-white/10"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'calendar' && (
          <button
            onClick={() => openEventModal({})}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
          >
            <span className="text-lg leading-none mb-0.5">+</span> {t('actions.addEvent', { defaultValue: 'Nuevo Evento' })}
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden px-4 md:px-6 pb-2">
        {/* Calendario */}
        {tab === 'calendar' && (
          <div className="flex-1 flex overflow-hidden gap-6">
            <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
              <ReminderPanel />
            </div>
            <div
              className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl relative"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <CalendarView onEventClick={handleEventClick} onSlotSelect={handleSlotSelect} onExternalDrop={handleExternalDrop} />
            </div>
          </div>
        )}

        {/* Rutinas */}
        {tab === 'routines' && (
          <div className="flex-1 overflow-y-auto">
            <RoutinesList />
          </div>
        )}

        {/* Categorías */}
        {tab === 'categories' && (
          <div className="flex-1 overflow-y-auto">
            <CategoriesManager />
          </div>
        )}

        {/* Integraciones */}
        {tab === 'integrations' && (
          <div className="flex-1 overflow-y-auto">
            <IntegrationsManager />
          </div>
        )}
      </div>

      <EventModal isOpen={eventModalOpen} onClose={closeEventModal} initialData={eventModalData} />
    </div>
  )
}