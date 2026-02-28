import { useState } from 'react'
import { useDeleteFlight } from '../hooks/useFlights'
import { flightsService } from '../../../services/flightsService'
import { useQueryClient } from '@tanstack/react-query'

const statusColors = {
  expected:  'bg-blue-100 text-blue-700',
  delayed:   'bg-amber-100 text-amber-700',
  canceled:  'bg-red-100 text-red-700',
  arrived:   'bg-green-100 text-green-700',
  en_route:  'bg-indigo-100 text-indigo-700',
}

export default function FlightCard({ flight }) {
  const [hovered, setHovered] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(flight.notes || '')
  const [saving, setSaving] = useState(false)

  const deleteFlight = useDeleteFlight()
  const qc = useQueryClient()

  const dep = flight.scheduled_departure
    ? new Date(flight.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const arr = flight.scheduled_arrival
    ? new Date(flight.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const statusClass = statusColors[flight.status] || 'bg-gray-100 text-gray-600'

  const handleDelete = async () => {
    if (!window.confirm(`Delete flight ${flight.flight_number}?`)) return
    deleteFlight.mutate(flight.id)
  }

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
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setEditingNotes(false)
      }}
    >
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black text-gray-900">{flight.origin_iata}</span>
            <span className="text-gray-300 text-lg">→</span>
            <span className="text-2xl font-black text-gray-900">{flight.destination_iata}</span>
          </div>

          <p className="text-xs text-gray-400 truncate">
            {flight.origin_city} → {flight.destination_city}
          </p>

          {flight.notes && !editingNotes && (
            <p className="text-xs text-sky-600 mt-1 truncate">{flight.notes}</p>
          )}

          {editingNotes && (
            <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
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
                className="text-xs px-2 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
              >
                {saving ? '…' : '✓'}
              </button>
            </div>
          )}
        </div>

        {/* Times */}
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-800">
            {dep} → {arr}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(flight.flight_date).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>

        {/* Status + number */}
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-gray-600 mb-1">
            {flight.flight_number}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
            {flight.status || 'scheduled'}
          </span>
        </div>
      </div>

      {/* Hover actions centradas */}
      {hovered && !editingNotes && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 z-20">
          
          {/* Edit */}
          <button
            onClick={() => setEditingNotes(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-md border border-gray-100 text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
            title="Edit notes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete flight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

        </div>
      )}
    </div>
  )
}