import { useRef, useState } from 'react'
import { useReminderMutations } from '../../hooks/useReminderMutations'

const PRIORITY_COLOR = {
  urgent: '#7c3aed',
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#94a3b8',
}

/* ─── Estilos compartidos del mini-form ──────────────────────────────────── */
const inputSt = {
  width: '100%', boxSizing: 'border-box',
  padding: '5px 8px', borderRadius: 6,
  border: '1px solid #e5e7eb', background: '#f9fafb',
  fontSize: 11.5, color: '#374151', outline: 'none',
  fontFamily: 'inherit',
}
const btnBase = {
  flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
  fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
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
    <div
      style={{
        margin: '2px 4px', borderRadius: '0 8px 8px 0',
        borderLeft: '3px solid #94a3b8',
        background: 'white',
        padding: '8px 10px',
        boxShadow: '0 2px 10px rgba(0,0,0,.07)',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      {/* Título */}
      <input
        autoFocus
        value={form.title}
        onChange={set('title')}
        placeholder="Título"
        style={inputSt}
      />

      {/* Descripción */}
      <textarea
        value={form.description}
        onChange={set('description')}
        placeholder="Descripción (opcional)"
        rows={2}
        style={{ ...inputSt, resize: 'none', lineHeight: 1.4 }}
      />

      {/* Prioridad */}
      <select value={form.priority} onChange={set('priority')} style={inputSt}>
        <option value="low">🟢 Baja</option>
        <option value="medium">🟡 Media</option>
        <option value="high">🔴 Alta</option>
        <option value="urgent">🟣 Urgente</option>
      </select>

      {/* Fecha límite */}
      <input
        type="date"
        value={form.due_date}
        onChange={set('due_date')}
        style={inputSt}
      />

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
        <button onClick={onCancel} style={{ ...btnBase, background: '#f3f4f6', color: '#6b7280' }}>
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={update.isPending || !form.title.trim()}
          style={{
            ...btnBase,
            background: update.isPending || !form.title.trim() ? '#e5e7eb' : '#111827',
            color: update.isPending || !form.title.trim() ? '#9ca3af' : 'white',
          }}
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
  const { remove } = useReminderMutations()

  const borderColor = color ?? PRIORITY_COLOR[reminder.priority] ?? '#94a3b8'

  /* ── D&D — PRESERVADO ÍNTEGRO ── */
  const handleDragStart = (e) => {
    e.dataTransfer.setData('reminderId', String(reminder.id))
    e.dataTransfer.setData('reminderTitle', reminder.title)
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart?.(reminder)
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

  /* ── Modo edición ── */
  if (editing) {
    return (
      <EditForm
        reminder={reminder}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    )
  }

  /* ── Vista normal ── */
  return (
    <div
      ref={ref}
      draggable
      data-reminder-id={String(reminder.id)}   /* ← requerido por CalendarView.handleExternalDrop */
      onDragStart={handleDragStart}
      onClick={() => onTap?.(reminder)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'stretch',
        borderRadius: '0 7px 7px 0',
        borderLeft: `3px solid ${borderColor}`,
        background: hovered ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.09)',
        margin: '2px 4px',
        cursor: 'grab',
        overflow: 'hidden',
        transition: 'background .12s',
        minHeight: 30,
        userSelect: 'none',
      }}
    >
      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0, padding: '5px 7px' }}>
        <p style={{
          fontSize: 12, fontWeight: 500, color: '#374151', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.45,
        }}>
          {reminder.title}
        </p>
        {reminder.due_date && (
          <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0', lineHeight: 1 }}>
            {reminder.due_date}
          </p>
        )}
      </div>

      {/* Botones de acción — visibles solo en hover */}
      {hovered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, paddingRight: 5, flexShrink: 0 }}>
          {/* Editar */}
          <button
            onClick={handleEditClick}
            title="Editar"
            style={{
              width: 20, height: 20, borderRadius: 4, border: 'none',
              background: 'transparent', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6b7280',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Eliminar */}
          <button
            onClick={handleDelete}
            title="Eliminar"
            style={{
              width: 20, height: 20, borderRadius: 4, border: 'none',
              background: 'transparent', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: remove.isPending ? '#fca5a5' : '#ef4444',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}