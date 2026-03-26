import { useRef, useState } from 'react'
import { useReminderMutations } from '../../hooks/useReminderMutations'
import clsx from 'clsx'

const PRIORITY_COLOR = {
  urgent: '#f472b6', // pink-400
  high:   '#ef4444', // red-500
  medium: '#fbbf24', // amber-400
  low:    '#94a3b8', // slate-400
}

/* ─── EditForm ───────────────────────────────────────────────────────────── */
function EditForm({ reminder, onCancel, onSaved }) {
  const { update } = useReminderMutations()
  const [form, setForm] = useState({
    title:       reminder.title       ?? '',
    description: reminder.description ?? '',
    priority:    reminder.priority    ?? 'medium',
    due_date:    reminder.due_date    ?? '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.title.trim()) return
    update.mutate(
      {
        id:          reminder.id,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        due_date:    form.due_date || null,
      },
      { onSuccess: onSaved },
    )
  }

  return (
    <div className="mx-2 my-1.5 rounded-2xl bg-black/40 border border-white/10 p-4 shadow-2xl flex flex-col gap-3 backdrop-blur-md">
      <input
        autoFocus
        value={form.title}
        onChange={set('title')}
        placeholder="Título"
        className="w-full px-3 py-2 text-sm bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30"
      />

      <textarea
        value={form.description}
        onChange={set('description')}
        placeholder="Descripción (opcional)"
        rows={2}
        className="w-full px-3 py-2 text-sm bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
      />

      <div className="relative">
        <select value={form.priority} onChange={set('priority')} 
          className="w-full px-3 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 appearance-none">
          <option value="low" className="bg-slate-900">🟢 Baja</option>
          <option value="medium" className="bg-slate-900">🟡 Media</option>
          <option value="high" className="bg-slate-900">🔴 Alta</option>
          <option value="urgent" className="bg-slate-900">🟣 Urgente</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <input
        type="date"
        value={form.due_date}
        onChange={set('due_date')}
        className="w-full px-3 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
      />

      <div className="flex gap-2 mt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-xs font-bold text-white/50 hover:bg-white/5 transition-all">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={update.isPending || !form.title.trim()}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-30 transition-all shadow-md"
        >
          {update.isPending ? '...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

/* ─── ReminderCard ───────────────────────────────────────────────────────── */
export default function ReminderCard({ reminder, color, onDragStart, onTap }) {
  const ref = useRef(null)
  const [hovered,  setHovered]  = useState(false)
  const [editing,  setEditing]  = useState(false)
  const { remove, update } = useReminderMutations()

  const borderColor = color ?? PRIORITY_COLOR[reminder.priority] ?? '#94a3b8'

  const handleDragStart = (e) => {
    e.dataTransfer.setData('reminderId', String(reminder.id))
    e.dataTransfer.setData('reminderTitle', reminder.title)
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart?.(reminder)
  }

  const handleComplete = (e) => {
    e.stopPropagation()
    if (update.isPending) return
    update.mutate({ id: reminder.id, status: 'done' })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (remove.isPending) return
    remove.mutate(reminder.id)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setEditing(true)
  }

  if (editing) {
    return (
      <EditForm
        reminder={reminder}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      ref={ref}
      draggable
      data-reminder-id={String(reminder.id)}
      onDragStart={handleDragStart}
      onClick={() => onTap?.(reminder)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        "flex items-stretch rounded-xl border transition-all cursor-grab group select-none overflow-hidden mx-1.5 my-0.5 active:scale-[0.98]",
        hovered ? "bg-white/20 border-white/20 shadow-lg translate-x-1" : "bg-white/10 border-white/10"
      )}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex-1 min-w-0 px-3 py-2">
        <p className="text-xs font-bold text-white truncate leading-relaxed transition-colors">
          {reminder.title}
        </p>
        {reminder.due_date && (
          <div className="flex items-center gap-1 mt-0.5">
             <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{reminder.due_date}</span>
          </div>
        )}
      </div>

      <div className={clsx(
        "flex items-center gap-1 pr-2 transition-all duration-200",
        hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
      )}>
        <button
          onClick={handleComplete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all active:scale-90"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <button
          onClick={handleEditClick}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}