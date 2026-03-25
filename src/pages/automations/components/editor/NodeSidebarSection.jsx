import { useAutomationsStore } from '../../store/editorStore'
import NodeSidebarItem from './NodeSidebarItem'

export default function NodeSidebarSection({ sectionKey, icon, label, items, onDragStart, nodeCategory }) {
  const toggleSection    = useAutomationsStore((s) => s.toggleSection)
  const collapsedSections = useAutomationsStore((s) => s.collapsedSections)
  const isCollapsed      = collapsedSections.has(sectionKey)

  if (!items?.length) return null

  return (
    <div className="mb-1">
      {/* Section header */}
      <button
        onClick={() => toggleSection(sectionKey)}
        className="text-white/60 hover:text-white/90 flex items-center justify-between gap-1.5 px-3 py-1.5 w-full text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg border-none bg-transparent cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="text-white/40 inline-block transition-transform duration-150" style={{
          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        }}>
          ▾
        </span>
      </button>

      {/* Items */}
      {!isCollapsed && (
        <div className="flex flex-col gap-0 pt-0.5 pb-1">
          {items.map((item) => (
            <NodeSidebarItem key={item.ref_id ?? item.label} item={item} onDragStart={onDragStart} nodeCategory={nodeCategory} />
          ))}
        </div>
      )}
    </div>
  )
}
