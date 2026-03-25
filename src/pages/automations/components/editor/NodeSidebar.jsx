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

  const resolvedFlowControl = FLOW_CONTROL_ITEMS.map((item) => ({
    ...item,
    label: t(item.labelKey),
    description: t(item.descKey),
  }))

  const filteredFlowControl = filterItems(resolvedFlowControl)

  return (
    <div className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col h-full overflow-hidden" style={{ width: 220, flexShrink: 0 }}>

      {/* Search */}
      <div className="px-2.5 pt-2.5 pb-1.5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('sidebar.search')}
          className="w-full bg-black/20 border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm box-border"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-3 pt-1">

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
                nodeCategory="trigger"
              />
            )
          })
        )}

        {/* ── Acciones ── */}
        <SectionHeader label={t('sidebar.actions')} className="mt-3" />

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
                nodeCategory="action"
              />
            )
          })
        )}

        {/* Sin resultados */}
        {search && filteredFlowControl.length === 0 &&
          Object.values(triggerGroups).every(g => !filterItems(g.items).length) &&
          Object.values(actionGroups).every(g => !filterItems(g.items).length) && (
          <div className="py-8 text-center">
            <p className="text-white/30 text-sm m-0">
              {t('sidebar.noResults', { query: search })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ label, className }) {
  return (
    <div className={`text-white/40 text-xs font-semibold uppercase tracking-wider px-3 py-2 ${className ?? ''}`}>
      {label}
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-1 px-1 py-0.5">
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 40, borderRadius: 10,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
