import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDeleteFlight } from '../hooks/useFlights'
import { flightsService } from '../services/flightsService'
import { useQueryClient } from '@tanstack/react-query'

const statusColors = {
  expected:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  delayed:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
  canceled:  'bg-red-500/20 text-red-300 border-red-500/30',
  arrived:   'bg-green-500/20 text-green-300 border-green-500/30',
  en_route:  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
}

export default function FlightCardMobile({ flight }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(flight.notes || '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteFlight = useDeleteFlight()
  const qc = useQueryClient()

  const dep = flight.scheduled_departure
    ? new Date(flight.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const arr = flight.scheduled_arrival
    ? new Date(flight.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const statusClass = statusColors[flight.status] || 'bg-white/10 text-white/70 border-white/20'

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await flightsService.updateNotes(flight.id, notes)
      qc.invalidateQueries({ queryKey: ['flights'] })
      setEditingNotes(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm">
      {/* Route */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-white">{flight.origin_iata}</span>
          <span className="text-white/30">→</span>
          <span className="text-lg font-black text-white">{flight.destination_iata}</span>
        </div>
        <p className="text-xs text-white/60 truncate">
          {flight.origin_city} → {flight.destination_city}
        </p>
        {flight.notes && !editingNotes && (
          <p className="text-xs text-white/70 mt-1 truncate font-medium">{flight.notes}</p>
        )}
        {editingNotes && (
          <div className="mt-2 flex gap-1.5" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="flex-1 text-xs px-2 py-1 rounded-lg bg-black/20 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50"
              placeholder="Add notes..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="text-xs px-2 py-1 bg-white/20 text-white rounded-lg disabled:opacity-50 border border-white/20"
            >
              {saving ? '…' : '✓'}
            </button>
          </div>
        )}
      </div>

      {/* Times + date */}
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-white">{dep} → {arr}</p>
        <p className="text-xs text-white/60">
          {new Date(flight.flight_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Status + actions */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="text-xs font-mono text-white/70">{flight.flight_number}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${statusClass}`}>
          {flight.status || 'scheduled'}
        </span>

        {/* Actions inline (no hover en mobile) */}
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => setEditingNotes(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => deleteFlight.mutate(flight.id)} className="text-xs px-2 py-1 bg-red-500/40 text-white rounded-lg border border-red-500/50">✓</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 border border-white/20 text-white/70 rounded-lg">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}