export default function NodeSidebarItem({ item, onDragStart, nodeCategory }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/xyflow-node', JSON.stringify({ ...item, nodeCategory }))
        onDragStart?.(item)
      }}
      className="flex items-center gap-2.5 mx-2 mb-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/[0.15] rounded-xl cursor-grab active:cursor-grabbing transition-all select-none"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-white/10">
        {item.icon ?? '⚙️'}
      </div>
      <div className="min-w-0">
        <div className="text-white/85 text-sm font-medium leading-snug">
          {item.label}
        </div>
        {item.description && (
          <div className="text-white/40 text-xs mt-0.5 line-clamp-1">
            {item.description}
          </div>
        )}
      </div>
    </div>
  )
}
