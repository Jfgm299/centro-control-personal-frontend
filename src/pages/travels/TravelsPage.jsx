import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTravelsStats } from './hooks/useTravelsStats'
import TravelsMap from './components/map/TravelsMap'
import TripsList from './components/trips/TripsList'
import TripDetail from './components/trips/TripDetail'
import StatsView from './components/stats/StatsView'

const TABS = ['map', 'trips', 'stats']

export default function TravelsPage() {
  const { t } = useTranslation('travels')
  const { stats } = useTravelsStats()

  const [activeTab, setActiveTab]   = useState('map')
  const [activeTripId, setActiveTripId] = useState(null)

  const handleTripClick = (tripId) => {
    setActiveTripId(tripId)
    setActiveTab('trips')
  }

  return (
    <div className="pb-10">

      {/* Page header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      {/* World map — always visible, full width, no horizontal padding */}
      {activeTab === 'map' && (
        <div className="mt-2 mb-4">
          <TravelsMap
            trips={stats.tripsWithCoords}
            visitedCountryCodes={stats.visitedCountryCodes}
            onTripClick={handleTripClick}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== 'trips') setActiveTripId(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            {/* Quick stats row below map */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t('kpi.countries'), value: stats.totalCountries, emoji: '🌍' },
                { label: t('kpi.trips'),     value: stats.totalTrips,     emoji: '✈️' },
                { label: t('kpi.days'),      value: stats.totalDays,      emoji: '📅' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100 text-center shadow-sm">
                  <div className="text-xl mb-0.5">{emoji}</div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-gray-400 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Hint */}
            {stats.tripsWithCoords.length === 0 && stats.totalTrips > 0 && (
              <p className="text-center text-gray-400 text-sm py-4">
                {t('map.noCoords')}
              </p>
            )}
            {stats.totalTrips === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">
                {t('map.empty')}
              </p>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          activeTripId
            ? <TripDetail tripId={activeTripId} onBack={() => setActiveTripId(null)} />
            : <TripsList onTripClick={setActiveTripId} />
        )}

        {activeTab === 'stats' && <StatsView />}
      </div>
    </div>
  )
}