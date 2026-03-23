import { motion } from 'framer-motion'

export default function MacroRow({ macro }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100/80">
        <span className="text-2xl">{macro.icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-md font-semibold text-slate-800">{macro.name}</h3>
        <p className="text-sm text-slate-500 truncate">{macro.description}</p>
      </div>
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z"></path></svg>
      </button>
    </motion.div>
  )
}
