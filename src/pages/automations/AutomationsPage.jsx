import { useState }               from 'react'
import { useIsMobile }            from '../../hooks/useIsMobile'
import { ReactFlowProvider }      from '@xyflow/react'
import AutomationsPageMobile      from './AutomationsPageMobile'
import AutomationsPageDesktop     from './AutomationsPageDesktop'
import AutomationEditor           from './components/editor/AutomationEditor'

export default function AutomationsPage() {
  const isMobile = useIsMobile()
  const [editingId, setEditingId] = useState(null)

  if (editingId) {
    return (
      <ReactFlowProvider>
        <AutomationEditor
          automationId={editingId}
          onClose={() => setEditingId(null)}
        />
      </ReactFlowProvider>
    )
  }

  const listProps = { onEdit: (automation) => setEditingId(automation.id) }

  return isMobile
    ? <AutomationsPageMobile {...listProps} />
    : <AutomationsPageDesktop {...listProps} />
}