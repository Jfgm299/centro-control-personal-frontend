import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { useAutomationsStore, getPrevNodeId } from '../../store/editorStore'
import FloatingPanel from '../ui/FloatingPanel'

/**
 * InputPreviewPanel — shows previous node output as current input.
 */
export default function InputPreviewPanel({ nodeId, nodes, edges, panel }) {
  const { t } = useTranslation('automations')

  const closePanel = useAutomationsStore((s) => s.closePanel)
  const nodeOutputData = useAutomationsStore((s) => s.nodeOutputData)

  const prevNodeId = getPrevNodeId(nodeId, nodes, edges)
  const prevNode = nodes?.find((n) => n.id === prevNodeId) ?? null
  const inputData = prevNodeId ? (nodeOutputData[prevNodeId]?.output ?? nodeOutputData[prevNodeId]?.input ?? null) : null

  return (
    <AnimatePresence>
      {panel?.open && (
        <FloatingPanel
          id="inputPreview"
          title={t('ndv.input', 'Input Data')}
          defaultWidth={280}
          defaultHeight={300}
          minWidth={200}
          minHeight={150}
          collapsible
          resizable
          defaultPosition={panel?.position ?? { x: 16, y: 16 }}
          onClose={() => closePanel('inputPreview')}
          className="input-preview-panel"
        >
          {!prevNode && (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-white/35 text-sm">
              {t('ndv.noInput', 'No input data for this node')}
            </div>
          )}

          {prevNode && !inputData && (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className="text-white/35 text-sm">
                <div className="font-medium">{prevNode.data?.label ?? prevNode.type}</div>
                <div className="text-xs mt-1 text-white/25">{t('ndv.noOutputHint', 'Run this step to see output')}</div>
              </div>
            </div>
          )}

          {prevNode && inputData && (
            <div className="h-full flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-white/10 text-xs text-white/55 truncate">{prevNode.data?.label ?? prevNode.type}</div>
              <div className="flex-1 overflow-auto p-3">
                <pre className="m-0 bg-black/30 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-white/75 whitespace-pre-wrap break-words">
                  {JSON.stringify(inputData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </FloatingPanel>
      )}
    </AnimatePresence>
  )
}
