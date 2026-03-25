import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useAutomationsStore } from '../../store/editorStore'
import { useRegistryTriggers, useRegistryActions } from '../../hooks/useRegistry'
import { FLOW_CONTROL_ITEMS } from '../editor/nodeTypes'
import NodeSidebarSection from '../editor/NodeSidebarSection'
import FloatingPanel from '../ui/FloatingPanel'

/**
 * Floating panel version of the node picker.
 * Renders as a draggable/resizable panel instead of fixed sidebar.
 */
export default function NodePickerPanel() {
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

  // Check if all sections are empty (no results)
  const hasNoResults = search && 
    filteredFlowControl.length === 0 &&
    Object.values(triggerGroups).every(g => !filterItems(g.items).length) &&
    Object.values(actionGroups).every(g => !filterItems(g.items).length)

  return (
    <FloatingPanel
      id="nodePicker"
      title={t('sidebar.addNode', 'Add Node')}
      defaultWidth={240}
      defaultHeight={500}
      minWidth={200}
      minHeight={250}
      defaultPosition={{ x: 16, y: 16 }}
      collapsible={true}
      resizable={true}
    >
      <div className="flex flex-col h-full">
        {/* Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search 
              size={14} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" 
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('sidebar.search')}
              className="glass-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {/* ── Triggers ── */}
          <SectionHeader label={t('sidebar.triggers')} />

          {loadingTriggers ? (
            <LoadingRows />
          ) : (
            Object.entries(triggerGroups).map(([moduleId, group]) => {
              const items = filterItems(group.items)
              if (!items.length && search) return null
              return (
                <NodeSidebarSection
                  key={moduleId}
                  sectionKey={`trigger_${moduleId}`}
                  icon={group.icon}
                  label={group.label}
                  items={items}
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
                  nodeCategory="action"
                />
              )
            })
          )}

          {/* Sin resultados */}
          {hasNoResults && (
            <div className="py-8 text-center">
              <p className="text-white/30 text-sm m-0">
                {t('sidebar.noResults', { query: search })}
              </p>
            </div>
          )}
        </div>
      </div>
    </FloatingPanel>
  )
}

function SectionHeader({ label, className }) {
  return (
    <div className={`text-white/40 text-xs font-semibold uppercase tracking-wider px-2 py-2 ${className ?? ''}`}>
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
