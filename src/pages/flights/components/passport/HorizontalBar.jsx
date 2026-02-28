export default function HorizontalBar({ label, count, maxCount, sublabel }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-white font-mono text-sm w-12 shrink-0">{label}</span>
      <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#7c3aed' }}
        />
      </div>
      <span className="text-white/60 text-sm w-6 text-right shrink-0">{count}</span>
      {sublabel && <span className="text-white/40 text-xs shrink-0">{sublabel}</span>}
    </div>
  )
}