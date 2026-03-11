export default function HorizontalBar({ label, count, maxCount, sublabel, color = '#60a5fa' }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  return (
    <div className="flex items-center gap-4 py-2 group">
      <span className="text-white/80 font-mono text-sm w-12 shrink-0 group-hover:text-white transition-colors">{label}</span>
      <div className="flex-1 bg-black/20 rounded-full h-2 overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-1000 relative"
          style={{ width: `${pct}%`, background: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
      <span className="text-white font-semibold text-sm w-6 text-right shrink-0">{count}</span>
      {sublabel && <span className="text-white/40 text-xs shrink-0">{sublabel}</span>}
    </div>
  )
}