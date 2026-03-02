import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTripById } from '../../hooks/useTrips'
import { useAlbums, useCreateAlbum, useDeleteAlbum } from '../../hooks/useAlbums'
import { useActivities, useCreateActivity, useDeleteActivity } from '../../hooks/useActivities'
import AlbumCard from '../albums/AlbumCard'
import AlbumForm from '../albums/AlbumForm'
import PhotoGrid from '../photos/PhotoGrid'
import ActivityForm from '../activities/ActivityForm'
import { ACTIVITY_CATEGORY_MAP } from '../../constants'

const TABS = ['albums', 'activities']

export default function TripDetail({ tripId, onBack }) {
  const { t } = useTranslation('travels')
  const { data: trip, isLoading } = useTripById(tripId)
  const { data: albums = [] }     = useAlbums(tripId)
  const { data: activities = [] } = useActivities(tripId)
  const deleteAlbum               = useDeleteAlbum(tripId)
  const deleteActivity            = useDeleteActivity(tripId)

  const [activeTab, setActiveTab]     = useState('albums')
  const [activeAlbum, setActiveAlbum] = useState(null)
  const [showAlbumForm, setShowAlbumForm]     = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!trip) return null

  // If viewing an album
  if (activeAlbum) return (
    <PhotoGrid
      album={activeAlbum}
      tripId={tripId}
      onBack={() => setActiveAlbum(null)}
    />
  )

  const handleDeleteActivity = async (id) => {
    await deleteActivity.mutateAsync(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack}
                className="mt-1 text-gray-400 hover:text-gray-700 text-sm bg-gray-100 px-2.5 py-1 rounded-lg">
          ← {t('detail.back')}
        </button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{trip.title}</h2>
          <p className="text-gray-500 text-sm">{trip.destination}</p>
        </div>
      </div>

      {/* Cover */}
      {trip.cover_photo_url && (
        <div className="rounded-2xl overflow-hidden" style={{ height: 200 }}>
          <img src={trip.cover_photo_url} alt={trip.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Meta */}
      {trip.description && (
        <p className="text-gray-600 text-sm">{trip.description}</p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}>
            {t(`detail.tabs.${tab}`)}
            {tab === 'albums' && albums.length > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({albums.length})</span>
            )}
            {tab === 'activities' && activities.length > 0 && (
              <span className="ml-1.5 text-xs opacity-60">({activities.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Albums tab */}
      {activeTab === 'albums' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowAlbumForm(true)}
                    className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-slate-700">
              + {t('albums.create')}
            </button>
          </div>

          {albums.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">{t('albums.empty')}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => setActiveAlbum(album)}
                onDelete={() => deleteAlbum.mutate(album.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activities tab */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setEditingActivity(null); setShowActivityForm(true) }}
                    className="bg-slate-900 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-slate-700">
              + {t('activities.create')}
            </button>
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-sm">{t('activities.empty')}</p>
            </div>
          )}

          <div className="space-y-2">
            {activities.map(act => {
              const cat = ACTIVITY_CATEGORY_MAP[act.category]
              return (
                <div key={act.id}
                     className="group flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-slate-200 transition-colors">
                  <span className="text-xl mt-0.5">{cat?.icon ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{act.title}</p>
                    {act.description && (
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{act.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {act.date && (
                        <span className="text-gray-400 text-xs">
                          {new Date(act.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {act.rating && (
                        <span className="text-yellow-500 text-xs">{'★'.repeat(act.rating)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons — visible on hover like en expenses */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit */}
                    <button
                      onClick={() => { setEditingActivity(act); setShowActivityForm(true) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete / Confirm */}
                    {confirmDeleteId === act.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(act.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAlbumForm && (
        <AlbumForm tripId={tripId} onClose={() => setShowAlbumForm(false)} />
      )}
      {showActivityForm && (
        <ActivityForm
          tripId={tripId}
          activity={editingActivity}
          onClose={() => { setShowActivityForm(false); setEditingActivity(null) }}
        />
      )}
    </div>
  )
}