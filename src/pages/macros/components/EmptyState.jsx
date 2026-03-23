import { motion } from 'framer-motion'

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>

export default function EmptyState({ onAction }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
    >
      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
        <span className="text-3xl">🤖</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-800">No Macros Yet</h3>
      <p className="text-slate-500 mt-2 max-w-xs">
        It looks like you haven't created any macros. Get started by creating your first automation.
      </p>
      <button 
        onClick={onAction}
        className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
      >
        <PlusIcon />
        Create First Macro
      </button>
    </motion.div>
  )
}
