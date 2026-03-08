import { useAutomationsStore } from '../../store/editorStore'
import NodeSidebarItem from './NodeSidebarItem'

export default function NodeSidebarSection({ sectionKey, icon, label, items, onDragStart }) {
  const toggleSection    = useAutomationsStore((s) => s.toggleSection)
  const collapsedSections = useAutomationsStore((s) => s.collapsedSections)
  const isCollapsed      = collapsedSections.has(sectionKey)

  if (!items?.length) return null

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Section header */}
      <button
        onClick={() => toggleSection(sectionKey)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '5px 10px',
          border: 'none', background: 'none', cursor: 'pointer',
          borderRadius: 6,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>
          {icon} {label}
        </span>
        <span style={{
          fontSize: 10, color: '#9ca3af',
          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s', display: 'inline-block',
        }}>
          ▾
        </span>
      </button>

      {/* Items */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '2px 4px 4px' }}>
          {items.map((item) => (
            <NodeSidebarItem key={item.ref_id ?? item.label} item={item} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  )
}