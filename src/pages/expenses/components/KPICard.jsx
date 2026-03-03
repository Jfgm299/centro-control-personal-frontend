/**
 * KPICard — displays a single metric with a label, value and optional trend.
 * compact prop: reduces padding and font sizes for mobile layouts
 */
export default function KPICard({ label, value, sub, accent = false, compact = false }) {
  return (
    <div
      className={`
        rounded-2xl border flex flex-col
        ${compact ? 'px-4 py-3 gap-0.5' : 'px-6 py-5 gap-1'}
        ${accent
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-white text-slate-800 border-slate-100 shadow-sm'
        }
      `}
    >
      <span className={`font-semibold uppercase tracking-widest text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {label}
      </span>
      <span className={`font-bold font-mono tabular-nums ${accent ? 'text-white' : 'text-slate-900'} ${compact ? 'text-xl' : 'text-3xl'}`}>
        {value}
      </span>
      {sub && (
        <span className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>{sub}</span>
      )}
    </div>
  )
}