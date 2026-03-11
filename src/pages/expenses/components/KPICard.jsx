/**
 * KPICard — displays a single metric with a label, value and optional trend.
 * compact prop: reduces padding and font sizes for mobile layouts
 */
export default function KPICard({ label, value, sub, accent = false, compact = false }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        backdrop-blur-xl backdrop-saturate-150
        bg-white/5 border border-white/10
        shadow-lg shadow-black/20
        flex flex-col
        ${compact ? 'px-4 py-3 gap-0.5' : 'px-6 py-5 gap-1'}
      `}
    >
      <span className={`font-semibold uppercase tracking-widest text-white/50 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {label}
      </span>
      <span className={`font-bold font-mono tabular-nums text-white ${compact ? 'text-xl' : 'text-3xl'}`}>
        {value}
      </span>
      {sub && (
        <span className={`text-white/50 ${compact ? 'text-[10px]' : 'text-xs'}`}>{sub}</span>
      )}
    </div>
  )
}
