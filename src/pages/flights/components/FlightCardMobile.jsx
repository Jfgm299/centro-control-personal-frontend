import { useState } from 'react'
import { useDeleteFlight } from '../hooks/useFlights'
import { flightsService } from '../services/flightsService'
import { useQueryClient } from '@tanstack/react-query'

const statusColors = {
  expected:  'bg-blue-100 text-blue-700',
  delayed:   'bg-amber-100 text-amber-700',
  canceled:  'bg-red-100 text-red-700',
  arrived:   'bg-green-100 text-green-700',
  en_route:  'bg-indigo-100 text-indigo-700',
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

  const statusClass = statusColors[flight.status] || 'bg-gray-100 text-gray-600'

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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
      {/* Route */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-gray-900">{flight.origin_iata}</span>
          <span className="text-gray-300">→</span>
          <span className="text-lg font-black text-gray-900">{flight.destination_iata}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {flight.origin_city} → {flight.destination_city}
        </p>
        {flight.notes && !editingNotes && (
          <p className="text-xs text-sky-600 mt-0.5 truncate">{flight.notes}</p>
        )}
        {editingNotes && (
          <div className="mt-1.5 flex gap-1.5" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="flex-1 text-xs px-2 py-1 rounded-lg border border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Add notes..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="text-xs px-2 py-1 bg-sky-500 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? '…' : '✓'}
            </button>
          </div>
        )}
      </div>

      {/* Times + date */}
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-gray-800">{dep} → {arr}</p>
        <p className="text-xs text-gray-400">
          {new Date(flight.flight_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Status + actions */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="text-xs font-mono text-gray-500">{flight.flight_number}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusClass}`}>
          {flight.status || 'scheduled'}
        </span>

        {/* Actions inline (no hover en mobile) */}
        <div className="flex gap-1 mt-0.5">
          <button
            onClick={() => setEditingNotes(v => !v)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => deleteFlight.mutate(flight.id)} className="text-xs px-1.5 py-0.5 bg-red-500 text-white rounded-lg">✓</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-1.5 py-0.5 border border-gray-200 text-gray-500 rounded-lg">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}