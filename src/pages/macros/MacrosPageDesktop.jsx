import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import MacroCard from './components/MacroCard'

// Mock data for now, we will replace this with real data fetching
const mockMacros = [
  { id: 1, name: 'Morning Routine', description: 'Runs coffee machine and opens blinds.', icon: '☕️' },
  { id: 2, name: 'Workout', description: 'Plays workout playlist and starts timer.', icon: '🏋️' },
  { id: 3, name: 'Focus Mode', description: 'Blocks distracting sites and plays focus music.', icon: '🎧' },
  { id: 4, name: 'Goodnight', description: 'Dims lights and sets a wake-up alarm.', icon: '🌙' },
  { id: 5, name: 'Reading Time', description: 'Sets ambient light and plays calming sounds.', icon: '📖' },
  { id: 6, name: 'Deploy', description: 'Runs the deployment script for the main project.', icon: '🚀' },
]

export default function MacrosPageDesktop() {
  const { t } = useTranslation('macros') // Assuming a 'macros' namespace for translations
  const [macros, setMacros] = useState(mockMacros)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} t={t} />

  return (
    <div className="flex flex-col gap-6 text-white p-4 md:p-6 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pt-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Macros</h1>
            <p className="text-white/60 mt-1">Automate your life with one-click actions.</p>
          </div>
          <button 
            // onClick={() => setModalExpense(null)} // TODO: Open create modal
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Macro
          </button>
        </div>
      </div>
      
      {/* Grid of Macros */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {macros.map(macro => (
          <MacroCard key={macro.id} macro={macro} />
        ))}
      </motion.div>
    </div>
  )
}

function LoadingState() {
  // Using a skeleton loader for a better UX
  return (
    <div className="flex flex-col gap-6">
      <div className="-mx-8 -mt-8 px-8 pt-8 pb-4 border-b border-gray-100/80">
        <div className="h-10 w-1/4 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-1/3 bg-gray-200 rounded-md mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mx-auto" />
            <div className="h-6 w-3/4 bg-gray-200 rounded-md mt-4 mx-auto animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded-md mt-2 mx-auto animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded-lg mt-6 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message, t }) {
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
      <p className="font-semibold">{t ? t('error.title') : 'An error occurred'}</p>
      <p className="text-sm mt-1 text-red-500">{message}</p>
    </div>
  )
}
