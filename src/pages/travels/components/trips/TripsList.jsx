import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrips } from '../../hooks/useTrips'
import { useDeleteTrip } from '../../hooks/useTripMutations'
import TripCard from './TripCard'
import TripForm from './TripForm'

export default function TripsList({ onTripClick }) {
  const { t } = useTranslation('travels')
  const { data: trips = [], isLoading, error } = useTrips()
  const deleteTrip  = useDeleteTrip()

  const [showForm, setShowForm]     = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [confirmId, setConfirmId]   = useState(null)

  const handleEdit   = (trip) => { setEditingTrip(trip); setShowForm(true) }
  const handleDelete = (id)   => {
    if (confirmId === id) { deleteTrip.mutate(id); setConfirmId(null) }
    else setConfirmId(id)
  }
  const handleCloseForm = () => { setShowForm(false); setEditingTrip(null) }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="text-center py-16 text-red-500 text-sm">{t('error.title')}</div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{trips.length} {t('list.count')}</p>
        <button onClick={() => setShowForm(true)}
                className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
          + {t('list.create')}
        </button>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="text-5xl">🗺️</div>
          <p className="text-gray-500 font-medium">{t('list.empty')}</p>
          <button onClick={() => setShowForm(true)}
                  className="bg-slate-900 text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-700">
            {t('list.create')}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {trips.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            onClick={onTripClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modals */}
      {showForm && (
        <TripForm trip={editingTrip} onClose={handleCloseForm} />
      )}
    </div>
  )
}