import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import MacroRow from './components/MacroRow'

// Mock data for now, we will replace this with real data fetching
const mockMacros = [
  { id: 1, name: 'Morning Routine', description: 'Runs coffee machine and opens blinds.', icon: '☕️' },
  { id: 2, name: 'Workout', description: 'Plays workout playlist and starts timer.', icon: '🏋️' },
  { id: 3, name: 'Focus Mode', description: 'Blocks distracting sites and plays focus music.', icon: '🎧' },
  { id: 4, name: 'Goodnight', description: 'Dims lights and sets a wake-up alarm.', icon: '🌙' },
]

export default function MacrosPageMobile() {
  const { t } = useTranslation('macros') // Assuming a 'macros' namespace for translations
  const [macros, setMacros] = useState(mockMacros)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} t={t} />

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Macros</h1>
          <p className="text-slate-400 mt-1 text-sm">Automate your life.</p>
        </div>
        <button 
          // onClick={() => setModalExpense(null)} // TODO: Open create modal
          className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* List of Macros */}
      <div className="flex flex-col gap-3">
        {macros.map(macro => (
          <MacroRow key={macro.id} macro={macro} />
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        <span className="text-sm">Loading macros…</span>
      </div>
    </div>
  )
}

function ErrorState({ message, t }) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
      <p className="font-semibold">{t ? t('error.title') : 'An error occurred'}</p>
      <p className="text-sm mt-1 text-red-500">{message}</p>
    </div>
  )
}
