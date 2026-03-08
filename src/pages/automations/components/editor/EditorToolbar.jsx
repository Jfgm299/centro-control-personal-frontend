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
    <div style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 10,
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      zIndex: 10,
    }}>

      {/* ── Back ── */}
      <button onClick={onBack} style={ghostBtn}>
        ← {t('editor.back')}
      </button>

      <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />

      {/* ── Nombre editable ── */}
      <input
        value={editorName}
        onChange={e => setEditorName(e.target.value)}
        style={{
          border: 'none', outline: 'none',
          fontSize: 14, fontWeight: 600, color: '#111827',
          background: 'transparent', width: 220,
          fontFamily: 'inherit',
        }}
        onBlur={onSave}
      />

      {/* ── Indicador guardado ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: saveDotColor, flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{saveLabel}</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Resultado última ejecución ── */}
      {lastResult && !isExecuting && (
        <div style={{
          fontSize: 12, fontWeight: 500, padding: '3px 10px',
          borderRadius: 8,
          background: lastResult.status === 'success' ? '#f0fdf4' : '#fef2f2',
          color:      lastResult.status === 'success' ? '#15803d' : '#dc2626',
        }}>
          {lastResult.status === 'success'
            ? t('editor.executionSuccess', { ms: lastResult.duration_ms })
            : (<>
                {t('editor.executionFailed', { node: lastResult.failed_node_id ?? '?' })}
                {lastResult.error_message && (
                  <span style={{ display: 'block', fontSize: 11, color: '#b91c1c', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastResult.error_message}
                  </span>
                )}
              </>)}
        </div>
      )}

      {/* ── Undo / Redo ── */}
      <button onClick={onUndo} disabled={!canUndo} title="Ctrl+Z" style={{ ...ghostBtn, opacity: canUndo ? 1 : 0.3 }}>
        ↩
      </button>
      <button onClick={onRedo} disabled={!canRedo} title="Ctrl+Y" style={{ ...ghostBtn, opacity: canRedo ? 1 : 0.3 }}>
        ↪
      </button>

      {/* ── Historial ── */}
      <button
        onClick={onToggleHistory}
        style={{ ...ghostBtn, background: showHistory ? '#f3f4f6' : '#fff' }}
        title={t('editor.historyTitle')}
      >
        🕓
      </button>

      <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
      <div
        onClick={() => onToggleActive(!isActive)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
      >
        <div style={{
          width: 34, height: 19, borderRadius: 10,
          background: isActive ? '#22c55e' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: isActive ? 17 : 2,
            width: 15, height: 15, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
          {isActive ? t('list.active') : t('list.inactive')}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />

      {/* ── Guardar ── */}
      <button
        onClick={onSave}
        disabled={!isDirty || isSaving}
        style={{
          ...solidBtn,
          background: isDirty && !isSaving ? '#0f172a' : '#e5e7eb',
          color:      isDirty && !isSaving ? '#fff'    : '#9ca3af',
          cursor:     isDirty && !isSaving ? 'pointer' : 'not-allowed',
        }}
      >
        {isSaving ? t('editor.saving') : t('editor.save')}
      </button>

      {/* ── Ejecutar ── */}
      <button
        onClick={onRun}
        disabled={isExecuting}
        style={{
          ...solidBtn,
          background: isExecuting ? '#f0fdf4' : '#16a34a',
          color:      isExecuting ? '#15803d' : '#fff',
          cursor:     isExecuting ? 'not-allowed' : 'pointer',
          gap: 5,
        }}
      >
        {isExecuting ? (
          <><Spinner color="#15803d" /> {t('editor.running')}</>
        ) : (
          `▶ ${t('editor.run')}`
        )}
      </button>

    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const ghostBtn = {
  padding: '5px 10px', borderRadius: 8,
  border: '1px solid #e5e7eb', background: '#fff',
  color: '#374151', fontSize: 12, fontWeight: 500,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
}

const solidBtn = {
  padding: '6px 14px', borderRadius: 8,
  border: 'none', fontSize: 13, fontWeight: 600,
  display: 'flex', alignItems: 'center',
}

function Spinner({ color = '#fff' }) {
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