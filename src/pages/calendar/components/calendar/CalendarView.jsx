import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin     from '@fullcalendar/daygrid'
import timeGridPlugin    from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useCalendarMutations } from '../../hooks/useCalendarMutations'
import { useCategories }        from '../../hooks/useCategories'
import { useCalendarEvents }    from '../../hooks/useCalendarEvents'
import { useCalendarStore }     from '../../store/calendarStore'
import clsx from 'clsx'

/* ─── CSS inyectado ─────────────────────────────────────────────────────────── */
const CALENDAR_CSS = `
  .fc-planner { font-family: inherit; height: 100%; border-radius: 24px; overflow: hidden; }
  .fc-planner .fc { height: 100%; background: transparent; }

  /* Grid lines sutiles blancas */
  .fc-planner .fc-theme-standard td,
  .fc-planner .fc-theme-standard th { border-color: rgba(255, 255, 255, 0.08); }
  .fc-planner .fc-scrollgrid { border: none; }
  .fc-planner .fc-scrollgrid-section > td { border: none; }

  /* Header columnas */
  .fc-planner .fc-col-header { background: transparent; }
  .fc-planner .fc-col-header-cell { border: none !important; background: transparent; }
  .fc-planner .fc-col-header-cell-cushion {
    text-decoration: none !important;
    padding: 12px 0 14px;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }

  /* Slots */
  .fc-planner .fc-timegrid-slot { height: 32px !important; }
  .fc-planner .fc-timegrid-slot-minor { border-top-style: none !important; }
  .fc-planner .fc-timegrid-slot-label-cushion { font-size: 11px; color: rgba(255, 255, 255, 0.4); padding-right: 12px; font-weight: 600; font-family: monospace; }
  .fc-planner .fc-timegrid-axis { border: none !important; }

  /* All-day row */
  .fc-planner .fc-daygrid-body { background: transparent; }
  .fc-planner .fc-daygrid-day { background: transparent !important; }
  .fc-planner .fc-daygrid-day-events { min-height: 0 !important; }

  /* Sin fondo hoy */
  .fc-planner .fc-day-today { background: rgba(255, 255, 255, 0.03) !important; }
  .fc-planner .fc-timegrid-col.fc-day-today { background: rgba(255, 255, 255, 0.03) !important; }

  /* ── EVENTOS: neutralizar TODO lo que pinta FullCalendar ── */
  .fc-planner .fc-event,
  .fc-planner .fc-event:hover {
    background:    transparent !important;
    background-color: transparent !important;
    border:        none !important;
    border-radius: 12px !important;
    box-shadow:    none !important;
    padding:       0 !important;
    margin:        2px 3px !important;
  }
  .fc-planner .fc-event-main {
    background: transparent !important;
    padding:    0 !important;
    height:     100%;
    overflow:   visible;
  }
  /* timegrid: el wrapper interior también tiene fondo */
  .fc-planner .fc-timegrid-event,
  .fc-planner .fc-timegrid-event .fc-event-main {
    background: transparent !important;
    border:     none !important;
    border-radius: 0 !important;
  }
  /* daygrid all-day */
  .fc-planner .fc-daygrid-event {
    background: transparent !important;
    border:     none !important;
    margin-bottom: 2px !important;
  }
  /* mirror (drag preview) */
  .fc-planner .fc-event-mirror {
    opacity: .6;
    filter: blur(1px);
  }

  /* Now indicator */
  .fc-planner .fc-timegrid-now-indicator-line { border-color: #38bdf8 !important; border-width: 2px !important; z-index: 10; box-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
  .fc-planner .fc-timegrid-now-indicator-arrow {
    border-top-color:    transparent !important;
    border-bottom-color: transparent !important;
    border-left-color:   #38bdf8 !important;
    border-width: 6px !important;
    margin-top: -6px;
  }

  /* All-day label */
  .fc-planner .fc-timegrid-axis-cushion { font-size: 10px; color: rgba(255, 255, 255, 0.4); padding: 0 8px; font-weight: bold; text-transform: uppercase; }

  /* Scrollbar */
  .fc-planner .fc-scroller::-webkit-scrollbar { width: 4px; }
  .fc-planner .fc-scroller::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
  .fc-planner .fc-scroller::-webkit-scrollbar-track { background: transparent; }

  /* More link */
  .fc-planner .fc-daygrid-more-link { font-size: 11px; color: rgba(255, 255, 255, 0.6); font-weight: bold; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 6px; }

  /* Ocultar toolbar nativo */
  .fc-planner .fc-header-toolbar { display: none !important; }

  /* Header border */
  .fc-planner .fc-scrollgrid-section-header > td { border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }

  @keyframes fc-spin { to { transform: rotate(360deg); } }
`

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function toFCEvent(event, categories) {
  const cat   = categories.find((c) => c.id === event.category_id)
  const color = event.color_override ?? cat?.color ?? '#60a5fa'
  return {
    id:     String(event.id ?? `r-${event.routine_id}-${event.start_at}`),
    title:  event.title,
    start:  event.start_at,
    end:    event.end_at,
    allDay: event.all_day,
    backgroundColor: 'transparent',
    borderColor:     'transparent',
    extendedProps: { color, isRoutine: !!event.routine_id, raw: event },
  }
}

function getInitialRange() {
  const now   = new Date()
  const diff  = (now.getDay() + 6) % 7
  const start = new Date(now); start.setDate(now.getDate() - diff)
  const end   = new Date(start); end.setDate(start.getDate() + 7)
  return { start, end }
}

function hexToRgb(hex) {
  const h = (hex ?? '#60a5fa').replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

/* ─── Day Header personalizado ───────────────────────────────────────────── */
function DayHeader({ date }) {
  const isToday = new Date().toDateString() === date.toDateString()
  const locale  = i18n.language ?? 'es'
  const dayName = date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '').toUpperCase()
  const dayNum  = date.getDate()
  return (
    <div className="flex flex-col items-center py-2 gap-1.5">
      <span className="text-[10px] font-bold text-white/40 tracking-widest">{dayName}</span>
      <span className={`
        text-base font-black w-8 h-8 flex items-center justify-center rounded-full transition-all
        ${isToday ? 'bg-white text-slate-900 shadow-lg scale-110' : 'text-white/80 hover:bg-white/10'}
      `}>{dayNum}</span>
    </div>
  )
}

/* ─── EventBlock — Glassmorphism ─────────────────────────────────────────── */
function EventBlock({ event }) {
  const color     = event.extendedProps?.color ?? '#60a5fa'
  const { r, g, b } = hexToRgb(color)

  const bgGlass   = `rgba(${r},${g},${b}, 0.25)`
  const borderGlass = `rgba(${r},${g},${b}, 0.4)`

  return (
    <div 
      className="flex flex-col h-full rounded-lg border backdrop-blur-md px-2 py-1.5 shadow-sm transition-all hover:brightness-110 overflow-hidden"
      style={{
        background: bgGlass,
        borderColor: borderGlass,
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.1)`,
      }}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
        <span className="text-[11px] font-bold text-white truncate leading-tight drop-shadow-sm">
          {event.title}
        </span>
      </div>
      {event.start && !event.allDay && (
        <div className="text-[9px] font-bold text-white/60 mt-1 flex items-center gap-1 tabular-nums">
          <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3" />
          </svg>
          {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

/* ─── Views ────────────────────────────────────────────────────────────────── */
export default function CalendarView({ onEventClick, onSlotSelect, onExternalDrop }) {
  const { t, i18n: { language } } = useTranslation('calendar')
  const fcLocale = language?.startsWith('es') ? 'es' : 'en'

  const VIEWS = [
    { key: 'timeGridDay',  label: t('views.day')   },
    { key: 'timeGridWeek', label: t('views.week')  },
    { key: 'dayGridMonth', label: t('views.month') },
  ]

  const calRef = useRef(null)
  const [view,  setView]  = useState('timeGridWeek')
  const [title, setTitle] = useState('')
  const [range, setRange] = useState(getInitialRange)

  const { move }                         = useCalendarMutations()
  const { data: categories = [] }        = useCategories()
  const { data: events = [], isLoading } = useCalendarEvents(range.start, range.end)

  const { hiddenCategoryIds, hiddenRoutineIds } = useCalendarStore()
  const fcEvents = events
    .filter(e => !hiddenCategoryIds.has(e.category_id))
    .filter(e => !(e.routine_id != null && hiddenRoutineIds.has(e.routine_id)))
    .map(e => toFCEvent(e, categories))

  const handleDatesSet = useCallback(({ start, end, view: v }) => {
    setTitle(v.title)
    setRange(prev =>
      prev.start?.getTime() === start.getTime() && prev.end?.getTime() === end.getTime()
        ? prev : { start, end }
    )
  }, [])

  const nav        = (dir) => dir === 'prev' ? calRef.current?.getApi().prev() : calRef.current?.getApi().next()
  const goToday    = ()    => calRef.current?.getApi().today()
  const changeView = (v)   => { setView(v); calRef.current?.getApi().changeView(v) }

  const handleEventDrop = ({ event }) => {
    const id = event.extendedProps.raw?.id
    if (!id || event.extendedProps.isRoutine) return
    move.mutate({ id, start: event.start, end: event.end, allDay: event.allDay })
  }
  const handleEventResize = ({ event }) => {
    const id = event.extendedProps.raw?.id
    if (!id || event.extendedProps.isRoutine) return
    move.mutate({ id, start: event.start, end: event.end, allDay: event.allDay })
  }

  const handleExternalDrop = useCallback(({ date, draggedEl, allDay }) => {
    const reminderId = draggedEl.dataset?.reminderId
    if (!reminderId) return
    const start = date
    const end   = new Date(date.getTime() + 60 * 60 * 1000)
    onExternalDrop?.(Number(reminderId), start, end, !!allDay)
  }, [onExternalDrop])

  return (
    <>
      <style>{CALENDAR_CSS}</style>

      <div className="flex flex-col h-full relative overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10 flex-shrink-0 bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
              <button onClick={() => nav('prev')} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all">‹</button>
              <button onClick={() => nav('next')} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all">›</button>
            </div>
            <span className="text-lg font-black text-white ml-2 drop-shadow-md capitalize">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
              {VIEWS.map(({ key, label }) => (
                <button 
                  key={key} 
                  onClick={() => changeView(key)} 
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                    view === key ? "bg-white/15 text-white shadow-lg border border-white/20" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <button 
              onClick={goToday} 
              className="px-4 py-2 bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl border border-white/20 hover:bg-white/20 transition-all shadow-sm active:scale-95"
            >
              {t('views.today')}
            </button>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="fc-planner flex-1 min-h-0 relative overflow-hidden group">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin shadow-lg" />
            </div>
          )}
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            locale={fcLocale}
            firstDay={1}
            headerToolbar={false}
            events={fcEvents}
            editable selectable selectMirror
            droppable
            dayMaxEvents={3}
            nowIndicator
            height="100%"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            allDaySlot
            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            datesSet={handleDatesSet}
            dayHeaderContent={({ date }) => <DayHeader date={date} />}
            eventContent={({ event }) => <EventBlock event={event} />}
            eventClick={({ event }) => { const r = event.extendedProps.raw; if (r) onEventClick?.(r) }}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            drop={handleExternalDrop}
            select={({ start, end, allDay }) => onSlotSelect?.({ start, end, allDay })}
            allDayText={t("event.fields.allDay")}
          />
        </div>
      </div>
    </>
  )
}

const navBtnStyle = {
  width: 26, height: 26, borderRadius: 6, border: '1px solid #e5e7eb',
  background: 'white', cursor: 'pointer', fontSize: 16, color: '#6b7280',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, fontWeight: 400, lineHeight: 1,
}