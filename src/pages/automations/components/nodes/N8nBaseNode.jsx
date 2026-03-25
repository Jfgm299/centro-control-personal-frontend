import { memo, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'

/**
 * N8n-style base node component with glass styling.
 * Provides consistent visual appearance across all node types.
 * 
 * @param {Object} props
 * @param {string} props.id - Node ID from xyflow
 * @param {boolean} props.selected - xyflow selection state
 * @param {React.ReactNode} props.children - Node content
 * @param {'trigger' | 'action' | 'condition' | 'delay' | 'stop'} props.category - Determines shape and accent color
 * @param {string} [props.icon] - Emoji or icon to display in badge
 * @param {string} [props.label] - Category label text
 * @param {string} [props.title] - Main node title
 * @param {string} [props.subtitle] - Optional subtitle/config preview
 * @param {string} [props.accentColor] - Override default category color
 * @param {number} [props.minWidth=200] - Minimum node width
 */
function N8nBaseNode({
  id,
  selected = false,
  children,
  category = 'action',
  icon,
  label,
  title,
  subtitle,
  accentColor,
  minWidth = 200,
}) {
  const { t } = useTranslation('automations')
  const { deleteElements } = useReactFlow()
  const executionState = useAutomationsStore((s) => s.executionState[id])
  const status = executionState?.status

  const handleDelete = useCallback((e) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }, [id, deleteElements])

  // Execution states
  const isRunning = status === 'running'
  const isSuccess = status === 'success'
  const isFailed = status === 'failed'
  const isSkipped = status === 'skipped'

  // Build class names for CSS styling
  const shapeClass = `node--${category}`
  const stateClass = isRunning ? 'node--executing'
    : isSuccess ? 'node--success'
    : isFailed ? 'node--error'
    : isSkipped ? 'node--skipped'
    : ''
  const selectedClass = selected && !status ? 'glass-node--selected' : ''

  // Category colors and default icons
  const categoryConfig = {
    trigger: { color: 'var(--node-trigger)', icon: '⚡', label: 'Trigger' },
    action: { color: 'var(--node-action)', icon: '⚙️', label: 'Action' },
    condition: { color: 'var(--node-condition)', icon: '🔀', label: 'Condition' },
    delay: { color: 'var(--node-delay)', icon: '⏳', label: 'Delay' },
    stop: { color: 'var(--node-stop)', icon: '🛑', label: 'Stop' },
  }
  const config = categoryConfig[category] ?? categoryConfig.action
  const color = accentColor ?? config.color
  const nodeIcon = icon ?? config.icon
  const nodeLabel = label ?? config.label

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Delete button */}
      <button
        onClick={handleDelete}
        title={t('nodes.deleteTitle')}
        className="node-delete-btn"
        style={{
          // Show on hover or when selected (handled via CSS)
          display: selected ? 'flex' : undefined,
        }}
      >
        ×
      </button>

      {/* Spinning border for running state */}
      {isRunning && (
        <div style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 14,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          {/* Track */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            border: '2px solid rgba(255,255,255,0.08)',
          }} />
          {/* Spinner */}
          <div style={{
            position: 'absolute',
            inset: '-100%',
            background: 'conic-gradient(from 0deg, transparent 0deg, #93c5fd 30deg, #3b82f6 60deg, transparent 90deg)',
            animation: 'node-spin 1s linear infinite',
          }} />
          {/* Inner mask */}
          <div style={{
            position: 'absolute',
            inset: 2,
            borderRadius: 12,
            background: 'var(--glass-bg-node)',
          }} />
        </div>
      )}

      {/* Node body */}
      <div
        className={`glass-node ${shapeClass} ${stateClass} ${selectedClass}`.trim()}
        style={{
          minWidth,
          position: 'relative',
          zIndex: 1,
          '--node-accent': color,
        }}
      >
        {/* Default content layout with icon badge */}
        {(nodeIcon || title) && !children && (
          <div className="node-content">
            <div className={`node-icon-badge node-icon-badge--${category}`}>
              {nodeIcon}
            </div>
            <div className="node-text">
              <div className={`node-label node-label--${category}`}>
                {nodeLabel}
              </div>
              {title && <div className="node-title">{title}</div>}
              {subtitle && <div className="node-subtitle">{subtitle}</div>}
            </div>
          </div>
        )}
        {children}
      </div>

      {/* Duration badge */}
      {executionState?.duration_ms != null && !isRunning && (
        <div className={`node-duration ${isSuccess ? 'node-duration--success' : 'node-duration--error'}`}>
          {isSuccess ? '✓' : '✗'} {executionState.duration_ms}ms
        </div>
      )}

      {/* Error tooltip */}
      {isFailed && executionState?.error && (
        <div className="node-error-tooltip">
          {executionState.error}
        </div>
      )}
    </div>
  )
}

export default memo(N8nBaseNode)
