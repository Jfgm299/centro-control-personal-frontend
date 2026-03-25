import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * Toolbar superior del editor fullscreen.
 *
 * Props:
 *   automationId  — string
 *   isActive      — bool
 *   onBack        — () => void
 *   onSave        — () => void
 *   onRun         — () => void
 *   onToggleActive — (bool) => void
 *   canUndo       — bool
 *   canRedo       — bool
 *   onUndo        — () => void
 *   onRedo        — () => void
 *   isSaving      — bool
 */
export default function EditorToolbar({
  isActive,
  onBack,
  onSave,
  onRun,
  onToggleActive,
  canUndo, canRedo,
  onUndo, onRedo,
  isSaving,
  showHistory,
  onToggleHistory,
}) {
  const { t } = useTranslation('automations')

  const isDirty       = useAutomationsStore((s) => s.isDirty)
  const isExecuting   = useAutomationsStore((s) => s.isExecuting)
  const editorName    = useAutomationsStore((s) => s.editorName)
  const setEditorName = useAutomationsStore((s) => s.setEditorName)
  const lastResult    = useAutomationsStore((s) => s.lastExecutionResult)

  const saveLabel = isSaving   ? t('editor.saving')
                  : isDirty    ? t('editor.unsavedChanges')
                  : t('editor.saved')

  const saveDotColor = isSaving ? '#f59e0b'
                     : isDirty  ? '#f59e0b'
                     : '#22c55e'

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-black/30 backdrop-blur-xl border-b border-white/10" style={{ height: 52, flexShrink: 0, zIndex: 10 }}>

      {/* ── Back ── */}
      <button
        onClick={onBack}
        className="bg-black/20 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
      >
        ← {t('editor.back')}
      </button>

      <div className="w-px h-5 bg-white/10 flex-shrink-0" />

      {/* ── Nombre editable ── */}
      <input
        value={editorName}
        onChange={e => setEditorName(e.target.value)}
        className="bg-transparent border-none outline-none text-white font-medium text-sm placeholder-white/30 min-w-0 flex-1"
        style={{ width: 220, fontFamily: 'inherit' }}
        onBlur={onSave}
      />

      {/* ── Indicador guardado ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: saveDotColor, flexShrink: 0,
        }} />
        <span className="text-white/50 text-xs">{saveLabel}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Resultado última ejecución ── */}
      {lastResult && !isExecuting && (
        <div className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
          lastResult.status === 'success'
            ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-400'
            : 'bg-red-500/15 border-red-400/25 text-red-400'
        }`}>
          {lastResult.status === 'success'
            ? t('editor.executionSuccess', { ms: lastResult.duration_ms })
            : (<>
                {t('editor.executionFailed', { node: lastResult.failed_node_id ?? '?' })}
                {lastResult.error_message && (
                  <span className="block text-[11px] text-red-400/80 mt-0.5 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {lastResult.error_message}
                  </span>
                )}
              </>)}
        </div>
      )}

      {/* ── Undo / Redo ── */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Ctrl+Z"
        className={`bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-lg px-3 py-1.5 text-sm transition-all cursor-pointer flex items-center gap-1 ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        ↩
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Ctrl+Y"
        className={`bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-lg px-3 py-1.5 text-sm transition-all cursor-pointer flex items-center gap-1 ${!canRedo ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        ↪
      </button>

      {/* ── Historial ── */}
      <button
        onClick={onToggleHistory}
        title={t('editor.historyTitle')}
        className={`border border-white/10 text-white/70 hover:text-white rounded-lg px-3 py-1.5 text-sm transition-all cursor-pointer flex items-center gap-1 ${showHistory ? 'bg-white/15' : 'bg-black/20 hover:bg-black/40'}`}
      >
        🕓
      </button>

      <div className="w-px h-5 bg-white/10 flex-shrink-0" />

      {/* ── Toggle activo ── */}
      <div
        onClick={() => onToggleActive(!isActive)}
        className="flex items-center gap-1.5 cursor-pointer"
      >
        <div style={{
          width: 34, height: 19, borderRadius: 10,
          background: isActive ? '#22c55e' : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: isActive ? 17 : 2,
            width: 15, height: 15, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <span className="text-xs font-medium text-white/70">
          {isActive ? t('list.active') : t('list.inactive')}
        </span>
      </div>

      <div className="w-px h-5 bg-white/10 flex-shrink-0" />

      {/* ── Guardar ── */}
      <button
        onClick={onSave}
        disabled={!isDirty || isSaving}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all flex items-center border ${
          isDirty && !isSaving
            ? 'bg-white/20 hover:bg-white/30 border-white/30 text-white cursor-pointer'
            : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
        }`}
      >
        {isSaving ? t('editor.saving') : t('editor.save')}
      </button>

      {/* ── Ejecutar ── */}
      <button
        onClick={onRun}
        disabled={isExecuting}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 border ${
          isExecuting
            ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400/60 cursor-not-allowed'
            : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40 text-emerald-400 cursor-pointer'
        }`}
      >
        {isExecuting ? (
          <><Spinner color="#4ade80" /> {t('editor.running')}</>
        ) : (
          `▶ ${t('editor.run')}`
        )}
      </button>

    </div>
  )
}

function Spinner({ color = '#4ade80' }) {
  return (
    <span style={{
      display: 'inline-block', width: 11, height: 11,
      border: `2px solid ${color}33`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.6s linear infinite', flexShrink: 0,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </span>
  )
}
