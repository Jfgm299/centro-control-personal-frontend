import { useState } from 'react'
import { motion } from 'framer-motion'

// Placeholder icons for actions. In a real app, you'd use an icon library like lucide-react.
const PlayIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path></svg>
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>

export default function MacroCard({ macro }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const handleDeletable = () => {
    setIsConfirmingDelete(true)
    setTimeout(() => {
      setIsConfirmingDelete(false)
    }, 2000)
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="group relative bg-white rounded-2xl border border-slate-100/80 shadow-sm transition-shadow p-6 flex flex-col items-center text-center"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/80 mb-4 transition-transform group-hover:scale-110">
        <span className="text-4xl">{macro.icon}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-slate-800">{macro.name}</h3>
      <p className="text-sm text-slate-500 mt-1 h-10">{macro.description}</p>

      {/* Actions on hover */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all shadow-md">
          <EditIcon />
        </button>
        <button
          onClick={handleDeletable}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-md ${
            isConfirmingDelete
              ? 'bg-red-500 text-white'
              : 'bg-white/50 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white/80'
          }`}
        >
          {isConfirmingDelete ? '?' : <DeleteIcon />}
        </button>
      </div>

      {/* Main action button */}
      <button className="w-full mt-6 rounded-lg bg-slate-800 text-white py-2.5 font-semibold text-sm transition-colors hover:bg-slate-900 group-hover:bg-blue-600">
        Run Macro
      </button>
    </motion.div>
  )
}
