export default function NodeSidebarItem({ item, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/xyflow-node', JSON.stringify(item))
        onDragStart?.(item)
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px', borderRadius: 8,
        border: '1px solid #f0f0f0', background: '#fff',
        cursor: 'grab', userSelect: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow   = '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#f0f0f0'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon ?? '⚙️'}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
          {item.label}
        </div>
        {item.description && (
          <div style={{
            fontSize: 10.5, color: '#9ca3af', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.description}
          </div>
        )}
      </div>
    </div>
  )
}