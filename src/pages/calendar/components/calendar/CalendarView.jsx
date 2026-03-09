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

/* ─── CSS inyectado ─────────────────────────────────────────────────────────── */
const CALENDAR_CSS = `
  .fc-planner { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; height: 100%; }
  .fc-planner .fc { height: 100%; background: white; }

  /* Grid lines sutiles */
  .fc-planner .fc-theme-standard td,
  .fc-planner .fc-theme-standard th { border-color: #f0f0f0; }
  .fc-planner .fc-scrollgrid { border: none; }
  .fc-planner .fc-scrollgrid-section > td { border: none; }

  /* Header columnas */
  .fc-planner .fc-col-header { background: white; }
  .fc-planner .fc-col-header-cell { border: none !important; background: white; }
  .fc-planner .fc-col-header-cell-cushion {
    text-decoration: none !important;
    padding: 8px 0 10px;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
  }

  /* Slots */
  .fc-planner .fc-timegrid-slot { height: 28px !important; }
  .fc-planner .fc-timegrid-slot-minor { border-top-style: none !important; }
  .fc-planner .fc-timegrid-slot-label-cushion { font-size: 11px; color: #9ca3af; padding-right: 10px; font-weight: 400; }
  .fc-planner .fc-timegrid-axis { border: none !important; }

  /* All-day row */
  .fc-planner .fc-daygrid-body { background: white; }
  .fc-planner .fc-daygrid-day { background: white !important; }
  .fc-planner .fc-daygrid-day-events { min-height: 0 !important; }

  /* Sin fondo amarillo en hoy */
  .fc-planner .fc-day-today { background: transparent !important; }
  .fc-planner .fc-timegrid-col.fc-day-today { background: transparent !important; }

  /* ── EVENTOS: neutralizar TODO lo que pinta FullCalendar ── */
  .fc-planner .fc-event,
  .fc-planner .fc-event:hover {
    background:    transparent !important;
    background-color: transparent !important;
    border:        none !important;
    border-radius: 0 !important;
    box-shadow:    none !important;
    padding:       0 !important;
    margin:        0 1px !important;
  }
  .fc-planner .fc-event-main {
    background: transparent !important;
    padding:    0 !important;
    height:     100%;
    overflow:   hidden;
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
    margin-bottom: 1px !important;
  }
  /* mirror (drag preview) */
  .fc-planner .fc-event-mirror {
    opacity: .75;
  }

  /* Now indicator */
  .fc-planner .fc-timegrid-now-indicator-line { border-color: #ef4444 !important; border-width: 1.5px !important; z-index: 10; }
  .fc-planner .fc-timegrid-now-indicator-arrow {
    border-top-color:    transparent !important;
    border-bottom-color: transparent !important;
    border-left-color:   #ef4444 !important;
    border-width: 5px !important;
    margin-top: -5px;
  }

  /* All-day label */
  .fc-planner .fc-timegrid-axis-cushion { font-size: 10px; color: #9ca3af; padding: 0 6px; }

  /* Scrollbar */
  .fc-planner .fc-scroller::-webkit-scrollbar { width: 4px; }
  .fc-planner .fc-scroller::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
  .fc-planner .fc-scroller::-webkit-scrollbar-track { background: transparent; }

  /* More link */
  .fc-planner .fc-daygrid-more-link { font-size: 11px; color: #6b7280; }

  /* Ocultar toolbar nativo */
  .fc-planner .fc-header-toolbar { display: none !important; }

  /* Header border */
  .fc-planner .fc-scrollgrid-section-header > td { border-bottom: 1px solid #f0f0f0 !important; }

  @keyframes fc-spin { to { transform: rotate(360deg); } }
`

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function toFCEvent(event, categories) {
  const cat   = categories.find((c) => c.id === event.category_id)
  const color = event.color_override ?? cat?.color ?? '#14b8a6'
  return {
    id:     String(event.id ?? `r-${event.routine_id}-${event.start_at}`),
    title:  event.title,
    start:  event.start_at,
    end:    event.end_at,
    allDay: event.all_day,
    // Pasamos el color para que FullCalendar no use su default azul
    backgroundColor: 'transparent',
    borderColor:     'transparent',
    extendedProps: { color, isRoutine: !!event.routine_id, raw: event },
  }
}

function getInitialRange() {
  const now   = new Date()
  // Empieza el lunes de la semana actual
  const diff  = (now.getDay() + 6) % 7   // días desde el lunes
  const start = new Date(now); start.setDate(now.getDate() - diff)
  const end   = new Date(start); end.setDate(start.getDate() + 7)
  return { start, end }
}

/* ─── Convierte hex a rgb ─────────────────────────────────────────────────── */
function hexToRgb(hex) {
  const h = (hex ?? '#14b8a6').replace('#', '')
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 8px', gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', letterSpacing: '.04em' }}>{dayName}</span>
      <span style={{
        fontSize: 18, fontWeight: 600, lineHeight: 1,
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%',
        background: isToday ? '#ef4444' : 'transparent',
        color:      isToday ? 'white'   : '#374151',
      }}>{dayNum}</span>
    </div>
  )
}

/* ─── EventBlock — estilo ClickUp ─────────────────────────────────────────── */
/*
 * ClickUp usa:
 *  - Fondo pastel: color base mezclado con blanco → rgba(r,g,b, 0.18)
 *  - Borde izquierdo sólido: 3px color base
 *  - Texto: color base (oscuro sobre fondo muy claro)
 */
function EventBlock({ event }) {
  const color     = event.extendedProps?.color ?? '#14b8a6'
  const { r, g, b } = hexToRgb(color)

  const bgPastel  = `rgba(${r},${g},${b},0.13)`   // ~13% → muy pastel, como ClickUp
  const textColor = color                           // mismo color pero sobre fondo casi blanco

  return (
    <div style={{
      display:    'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      borderLeft: `3px solid ${color}`,
      background: bgPastel,
      height:     '100%',
      minHeight:  18,
      borderRadius: '0 4px 4px 0',
      padding:    '3px 6px',
      overflow:   'hidden',
      boxSizing:  'border-box',
    }}>
      <div style={{
        fontSize:     11.5,
        fontWeight:   600,
        color:        textColor,
        lineHeight:   1.35,
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
      }}>
        {event.title}
      </div>
      {event.start && !event.allDay && (
        <div style={{ fontSize: 10.5, color: textColor, opacity: .75, marginTop: 1 }}>
          {event.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          {event.end ? ` - ${event.end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </div>
      )}
    </div>
  )
}

/* ─── Views ────────────────────────────────────────────────────────────────── */
/* ─── CalendarView ─────────────────────────────────────────────────────────── */
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

  // Drop externo desde el panel lateral.
  // FullCalendar provee `date` = hora exacta del slot y `draggedEl` = el DOM element arrastrado.
  const handleExternalDrop = useCallback(({ date, draggedEl, allDay }) => {
    const reminderId = draggedEl.dataset?.reminderId
    if (!reminderId) return
    const start = date
    const end   = new Date(date.getTime() + 60 * 60 * 1000) // +1h por defecto
    onExternalDrop?.(Number(reminderId), start, end, !!allDay)
  }, [onExternalDrop])

  return (
    <>
      <style>{CALENDAR_CSS}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px - 48px)', minHeight: 500 }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px 10px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => nav('prev')} style={navBtnStyle}>‹</button>
            <button onClick={() => nav('next')} style={navBtnStyle}>›</button>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginLeft: 4 }}>{title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
              {VIEWS.map(({ key, label }) => (
                <button key={key} onClick={() => changeView(key)} style={{
                  padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500,
                  background: view === key ? 'white' : 'transparent',
                  color:      view === key ? '#111827' : '#6b7280',
                  boxShadow:  view === key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                }}>{label}</button>
              ))}
            </div>
            <button onClick={goToday} style={{
              padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb',
              background: 'white', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>{t('views.today')}</button>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="fc-planner" style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {isLoading && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #e0e7ff', borderTopColor: '#6366f1', animation: 'fc-spin .7s linear infinite' }} />
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
            dayMaxEvents={2}
            nowIndicator
            height="100%"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            allDaySlot
            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
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