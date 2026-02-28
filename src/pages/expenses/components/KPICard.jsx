/**
 * KPICard — displays a single metric with a label, value and optional trend.
 */
export default function KPICard({ label, value, sub, accent = false }) {
  return (
    <div
      className={`
        rounded-2xl px-6 py-5 flex flex-col gap-1 border
        ${accent
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-white text-slate-800 border-slate-100 shadow-sm'
        }
      `}
    >
      <span className={`text-xs font-semibold uppercase tracking-widest ${accent ? 'text-slate-400' : 'text-slate-400'}`}>
        {label}
      </span>
      <span className={`text-3xl font-bold font-mono tabular-nums ${accent ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </span>
      {sub && (
        <span className={`text-xs ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</span>
      )}
    </div>
  )
}