import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { useAutomationsStore } from '../../store/editorStore'
import FloatingPanel from '../ui/FloatingPanel'

/**
 * OutputPreviewPanel — shows selected node execution output.
 */
export default function OutputPreviewPanel({ nodeId, panel }) {
  const { t } = useTranslation('automations')

  const closePanel = useAutomationsStore((s) => s.closePanel)
  const nodeOutputData = useAutomationsStore((s) => s.nodeOutputData)

  const outputEntry = nodeId ? nodeOutputData[nodeId] : null
  const hasOutputKey = Boolean(
    nodeId &&
    outputEntry &&
    Object.prototype.hasOwnProperty.call(outputEntry, 'output')
  )
  const outputData = hasOutputKey ? outputEntry.output : null
  const hasOutput = hasOutputKey && outputData !== null && outputData !== undefined

  return (
    <AnimatePresence>
      {panel?.open && (
        <FloatingPanel
          id="outputPreview"
          title={t('ndv.output', 'Output Data')}
          defaultWidth={280}
          defaultHeight={300}
          minWidth={200}
          minHeight={150}
          collapsible
          resizable
          defaultPosition={panel?.position ?? { x: 16, y: 16 }}
          onClose={() => closePanel('outputPreview')}
          className="output-preview-panel"
        >
          {!hasOutput && (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-white/35 text-sm">
              {t('ndv.noOutputHint', 'Run this step to see output')}
            </div>
          )}

          {hasOutput && (
            <div className="h-full flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-white/10 text-xs text-white/55">{t('ndv.hasOutput', 'Output available')}</div>
              <div className="flex-1 overflow-auto p-3">
                <pre className="m-0 bg-black/30 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-white/75 whitespace-pre-wrap break-words">
                  {JSON.stringify(outputData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </FloatingPanel>
      )}
    </AnimatePresence>
  )
}
