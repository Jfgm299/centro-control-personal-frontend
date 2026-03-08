import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'
import { useRegistryTriggers, useRegistryActions } from '../../hooks/useRegistry'
import { FLOW_CONTROL_ITEMS } from './nodeTypes'
import NodeSidebarSection from './NodeSidebarSection'

export default function NodeSidebar({ onDragStart }) {
  const { t } = useTranslation('automations')

  const search    = useAutomationsStore((s) => s.sidebarSearch)
  const setSearch = useAutomationsStore((s) => s.setSidebarSearch)

  const { grouped: triggerGroups, isLoading: loadingTriggers } = useRegistryTriggers()
  const { grouped: actionGroups,  isLoading: loadingActions  } = useRegistryActions()

  // Filtra items por search
  const filterItems = (items = []) => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (item) =>
        item.label?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    )
  }

  const filteredFlowControl = filterItems(FLOW_CONTROL_ITEMS)

  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid #f0f0f0',
      background: '#fafafa',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'hidden',
    }}>

      {/* Search */}
      <div style={{ padding: '10px 10px 6px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('sidebar.search')}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '6px 10px', fontSize: 12,
            border: '1px solid #e5e7eb', borderRadius: 8,
            outline: 'none', background: '#fff', color: '#111827',
          }}
        />
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 12px' }}>

        {/* ── Triggers ── */}
        <SectionHeader label={t('sidebar.triggers')} />

        {loadingTriggers ? (
          <LoadingRows />
        ) : (
          Object.entries(triggerGroups).map(([moduleId, group]) => {
            const items = filterItems(group.items)
            return (
              <NodeSidebarSection
                key={moduleId}
                sectionKey={`trigger_${moduleId}`}
                icon={group.icon}
                label={group.label}
                items={items}
                onDragStart={onDragStart}
              />
            )
          })
        )}

        {/* ── Acciones ── */}
        <SectionHeader label={t('sidebar.actions')} style={{ marginTop: 12 }} />

        {/* Control de flujo — siempre presente */}
        <NodeSidebarSection
          sectionKey="flow_control"
          icon="⚙️"
          label={t('sidebar.flowControl')}
          items={filteredFlowControl}
          onDragStart={onDragStart}
        />

        {loadingActions ? (
          <LoadingRows />
        ) : (
          Object.entries(actionGroups).map(([moduleId, group]) => {
            const items = filterItems(group.items)
            if (!items.length && search) return null
            return (
              <NodeSidebarSection
                key={moduleId}
                sectionKey={`action_${moduleId}`}
                icon={group.icon}
                label={group.label}
                items={items}
                onDragStart={onDragStart}
              />
            )
          })
        )}

        {/* Sin resultados */}
        {search && filteredFlowControl.length === 0 &&
          Object.values(triggerGroups).every(g => !filterItems(g.items).length) &&
          Object.values(actionGroups).every(g => !filterItems(g.items).length) && (
          <div style={{ padding: '20px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {t('sidebar.noResults', { query: search })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ label, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '6px 10px 4px', ...style,
    }}>
      {label}
    </div>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '2px 4px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 40, borderRadius: 8,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}