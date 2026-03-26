import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'
import VariablePicker, { insertAtCursor } from './VariablePicker'
import ExpressionEditorModal from './ExpressionEditorModal'
import { ScheduleOnceConfig, ScheduleIntervalConfig } from './ScheduleConfig'
import { WebhookInboundConfig, WebhookOutboundConfig } from './WebhookConfig'

const glassInput = 'w-full px-3 py-2 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all'
const glassSelect = glassInput + ' appearance-none'
const glassLabel = 'text-white/60 text-sm mb-1 block'
const glassSectionLabel = 'text-white/40 text-xs font-semibold uppercase tracking-wider mb-2'

function makeDropZoneHandlers(onChange) {
  return {
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      const variablePath = e.dataTransfer.getData('variable')
      if (!variablePath) return
      const el = e.currentTarget
      const token = `{{${variablePath}}}`
      const currentValue = String(el.value ?? '')
      const start = el.selectionStart ?? currentValue.length
      const end = el.selectionEnd ?? currentValue.length
      const nextValue = currentValue.slice(0, start) + token + currentValue.slice(end)
      onChange(nextValue)
    },
  }
}

function ExpressionFxButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white/10 hover:bg-white/20 border border-white/15 text-white/65 hover:text-white rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors"
      title="Open expression editor"
    >
      fx
    </button>
  )
}

function ExpressionInput({ value, onChange, onFxClick, placeholder, dropZoneHandlers = {}, fieldId }) {
  const [dragOver, setDragOver] = useState(false)
  const isExpr = typeof value === 'string' && value.includes('{{')

  const dzHandlers = {
    ...dropZoneHandlers,
    onDragOver: (e) => { e.preventDefault(); setDragOver(true); dropZoneHandlers.onDragOver?.(e) },
    onDragLeave: () => { setDragOver(false); dropZoneHandlers.onDragLeave?.() },
    onDrop: (e) => { setDragOver(false); dropZoneHandlers.onDrop?.(e) },
  }

  if (isExpr) {
    return (
      <div
        className={`ndv-field-wrapper ndv-expr-container${dragOver ? ' drag-over' : ''}`}
        {...dzHandlers}
        onClick={onFxClick}
      >
        <span className="ndv-expr-pill">{value}</span>
        <button className="ndv-fx-btn" onClick={(e) => { e.stopPropagation(); onFxClick(e) }}>fx</button>
      </div>
    )
  }

  return (
    <div className={`ndv-field-wrapper${dragOver ? ' drag-over' : ''}`} {...dzHandlers}>
      <input
        className="ndv-field-input"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button className="ndv-fx-btn" onClick={onFxClick}>fx</button>
    </div>
  )
}

function coerceMaybeNumber(rawValue, fieldType) {
  if (fieldType !== 'int' && fieldType !== 'float') return rawValue
  const text = String(rawValue ?? '')
  if (text.includes('{{') || text.trim() === '') return text
  const parsed = Number(text)
  return Number.isNaN(parsed) ? text : parsed
}

/**
 * Map of ref_id → specific config component.
 * Add entries here only for nodes that need custom UI beyond the generic schema renderer.
 */
const SPECIFIC_CONFIGS = {
  'system.schedule_once':                ScheduleOnceConfig,
  'system.schedule_interval':            ScheduleIntervalConfig,
  'system.webhook_inbound':              WebhookInboundConfig,
  'automations_engine.outbound_webhook': WebhookOutboundConfig,
}

/**
 * Panel lateral derecho del editor.
 * Se muestra cuando hay un nodo seleccionado.
 *
 * Props:
 *   node         — nodo seleccionado de xyflow (con data, type, id)
 *   onUpdate     — (nodeId, newData) => void — actualiza data del nodo en el canvas
 *   onDelete     — (nodeId) => void
 *   variables    — lista de variables disponibles para el VariablePicker
 *   automationId — para generar webhook
 */
export default function NodeConfigPanel({ node, onUpdate, onDelete, variables = [], automationId, noContainer = false }) {
  const { t } = useTranslation('automations')
  const clearSelection = useAutomationsStore((s) => s.clearSelection)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expressionEditor, setExpressionEditor] = useState(null)

  if (!node) {
    if (noContainer) {
      return (
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-white/30 text-sm text-center">
            {t('nodes.config.noNodeSelected')}
          </p>
        </div>
      )
    }
    return (
      <div className="w-[280px] shrink-0 bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-5">
          <p className="text-white/30 text-sm text-center">
            {t('nodes.config.noNodeSelected')}
          </p>
        </div>
      </div>
    )
  }

  const config   = node.data?.config ?? {}
  const setConfig = (newConfig) => onUpdate(node.id, { config: newConfig })

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDelete(node.id)
    clearSelection()
  }

  const body = (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

      {/* ── Flow-control nodes — identified by node.type ── */}
      {node.type === 'condition' && (
        <div className="pb-4 border-b border-white/10">
          <ConditionConfig
            node={node}
            config={config}
            onChange={setConfig}
            variables={variables}
            onOpenExpression={setExpressionEditor}
          />
        </div>
      )}
      {node.type === 'delay' && (
        <div className="pb-4 border-b border-white/10">
          <DelayConfig
            node={node}
            config={config}
            onChange={setConfig}
          />
        </div>
      )}
      {node.type === 'stop' && (
        <div className="pb-4 border-b border-white/10">
          <StopConfig
            node={node}
            config={config}
            onChange={setConfig}
          />
        </div>
      )}

      {/* ── Nodes with specific custom UI — identified by ref_id ── */}
      {node.type !== 'condition' && node.type !== 'delay' && node.type !== 'stop' &&
       SPECIFIC_CONFIGS[node.data?.ref_id] && (
        <div className="pb-4 border-b border-white/10">
          {React.createElement(SPECIFIC_CONFIGS[node.data.ref_id], {
            node,
            config,
            onChange: setConfig,
            variables,
            onOpenExpression: setExpressionEditor,
            webhookToken: node.data?.webhook_token,
          })}
        </div>
      )}

      {/* ── Generic fallback — any node with config_schema (action OR trigger) ── */}
      {node.type !== 'condition' && node.type !== 'delay' && node.type !== 'stop' &&
       !SPECIFIC_CONFIGS[node.data?.ref_id] &&
       node.data?.config_schema && Object.keys(node.data.config_schema).length > 0 && (
        <div className="pb-4 border-b border-white/10">
          <GenericNodeConfig
            schema={node.data.config_schema}
            config={config}
            onChange={setConfig}
            variables={variables}
            onOpenExpression={setExpressionEditor}
          />
        </div>
      )}

      {/* ── No parameters ── */}
      {node.type !== 'condition' && node.type !== 'delay' && node.type !== 'stop' &&
       !SPECIFIC_CONFIGS[node.data?.ref_id] &&
       (!node.data?.config_schema || Object.keys(node.data.config_schema).length === 0) && (
        <div className="ndv-empty-state">
          <span className="ndv-empty-icon">⚙️</span>
          <span>{t('nodes.config.noParams', { defaultValue: 'This node has no parameters' })}</span>
        </div>
      )}

      {/* ── Continue on error (todas las acciones) ── */}
      {node.type === 'action' && (
        <div className="pb-4 border-b border-white/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-white/60"
              checked={node.data?.continue_on_error ?? false}
              onChange={e => onUpdate(node.id, { continue_on_error: e.target.checked })}
            />
            <span className="text-white/70 text-sm">
              {t('nodes.config.continueOnError')}
            </span>
          </label>
        </div>
      )}

      {/* ── Eliminar nodo ── */}
      {node.type !== 'trigger' && (
        <div className="mt-2">
          <button
            onClick={handleDelete}
            onMouseLeave={() => setConfirmDelete(false)}
            className={
              confirmDelete
                ? 'bg-red-500/40 hover:bg-red-500/50 border border-red-400/60 text-red-300 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all'
                : 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-lg px-3 py-1.5 text-sm font-medium transition-all'
            }
          >
            {confirmDelete ? t('nodes.config.confirmDelete') : `🗑 ${t('nodes.config.delete')}`}
          </button>
        </div>
      )}
    </div>
  )

  if (noContainer) {
    return (
      <>
        {body}
        <ExpressionEditorModal
          isOpen={Boolean(expressionEditor)}
          title={expressionEditor?.label ?? 'Expression Editor'}
          value={expressionEditor?.value ?? ''}
          variables={variables}
          previewContext={node?.data?.last_input ?? {}}
          onClose={() => setExpressionEditor(null)}
          onApply={(nextValue) => {
            expressionEditor?.onApply?.(nextValue)
            setExpressionEditor(null)
          }}
        />
      </>
    )
  }

  return (
    <div className="w-[280px] shrink-0 bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
        <div>
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            {typeLabel(node.type, t)}
          </div>
          <div className="text-white/85 text-sm font-semibold mt-0.5">
            {node.data?.label ?? node.type}
          </div>
        </div>
        <button
          onClick={() => { clearSelection(); setConfirmDelete(false) }}
          className="border-none bg-transparent cursor-pointer text-lg text-white/40 hover:text-white/70 leading-none transition-colors"
        >
          ×
        </button>
      </div>
      {body}

      <ExpressionEditorModal
        isOpen={Boolean(expressionEditor)}
        title={expressionEditor?.label ?? 'Expression Editor'}
        value={expressionEditor?.value ?? ''}
        variables={variables}
        previewContext={node?.data?.last_input ?? {}}
        onClose={() => setExpressionEditor(null)}
        onApply={(nextValue) => {
          expressionEditor?.onApply?.(nextValue)
          setExpressionEditor(null)
        }}
      />
    </div>
  )
}

// ── Sub-configs ───────────────────────────────────────────────────────────────

function ConditionConfig({ config, onChange, variables, onOpenExpression }) {
  const { t } = useTranslation('automations')
  const fieldRef = useRef(null)
  const valueRef = useRef(null)
  const set = (k, v) => onChange({ ...config, [k]: v })

  const OPERATORS = ['eq', 'neq', 'gt', 'lt', 'contains', 'exists', 'not_exists']
  const hideValue = ['exists', 'not_exists'].includes(config.operator)

  return (
    <div className="flex flex-col gap-3">
      <div className="ndv-field-group">
        <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
          <label className="ndv-field-label" style={{ marginBottom: 0 }}>{t('condition.field')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(fieldRef, v)} />
        </div>
        <ExpressionInput
          value={config.field ?? ''}
          onChange={e => set('field', e.target.value)}
          onFxClick={() => onOpenExpression?.({
            key: 'field',
            label: t('condition.field'),
            value: config.field ?? '',
            onApply: (next) => set('field', next),
          })}
          placeholder="payload.status"
          dropZoneHandlers={makeDropZoneHandlers((next) => set('field', next))}
        />
      </div>
      <div className="ndv-field-group">
        <label className="ndv-field-label">{t('condition.operator')}</label>
        <select value={config.operator ?? 'eq'} onChange={e => set('operator', e.target.value)} className={glassSelect}>
          {OPERATORS.map(op => (
            <option key={op} value={op}>{t(`condition.operators.${op}`)}</option>
          ))}
        </select>
      </div>
      {!hideValue && (
        <div className="ndv-field-group">
          <label className="ndv-field-label">{t('condition.value')}</label>
          <ExpressionInput
            value={config.value ?? ''}
            onChange={e => set('value', e.target.value)}
            onFxClick={() => onOpenExpression?.({
              key: 'value',
              label: t('condition.value'),
              value: config.value ?? '',
              onApply: (next) => set('value', next),
            })}
            placeholder="completed"
            dropZoneHandlers={makeDropZoneHandlers((next) => set('value', next))}
          />
        </div>
      )}
    </div>
  )
}

function DelayConfig({ config, onChange }) {
  const { t } = useTranslation('automations')
  const set = (k, v) => onChange({ ...config, [k]: v })
  return (
    <div className="flex gap-2">
      <div className="flex-1 ndv-field-group">
        <label className="ndv-field-label">{t('delay.label')}</label>
        <div className="ndv-field-wrapper">
          <input
            type="number" min={1}
            value={config.delay_value ?? ''}
            onChange={e => set('delay_value', Number(e.target.value))}
            className="ndv-field-input"
          />
        </div>
      </div>
      <div className="flex-1 ndv-field-group">
        <label className="ndv-field-label">&nbsp;</label>
        <select value={config.delay_unit ?? 'minutes'} onChange={e => set('delay_unit', e.target.value)} className="ndv-field-select">
          {['seconds', 'minutes', 'hours', 'days'].map(u => (
            <option key={u} value={u}>{t(`delay.${u}`)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function StopConfig({ config, onChange }) {
  const { t } = useTranslation('automations')
  return (
    <div className="ndv-field-group">
      <label className="ndv-field-label">{t('nodes.stop')}</label>
      <div className="ndv-field-wrapper">
        <input
          value={config.reason ?? ''}
          onChange={e => onChange({ ...config, reason: e.target.value })}
          placeholder={t('nodes.stopReasonPlaceholder')}
          className="ndv-field-input"
        />
      </div>
    </div>
  )
}

/**
 * Renderiza los campos de un nodo acción basándose en su config_schema.
 * Soporta tipos: string, text, int, float, bool, enum, datetime.
 */
function GenericNodeConfig({ schema, config, onChange, variables, onOpenExpression }) {
  const refs = useRef({})
  const set  = (k, v) => onChange({ ...config, [k]: v })

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(schema).map(([key, field]) => {
        const value = config[key] ?? field.default ?? ''

        if (field.type === 'bool') {
          return (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-white/60" checked={!!value} onChange={e => set(key, e.target.checked)} />
              <span className="text-white/70 text-sm">{field.label}</span>
            </label>
          )
        }

        if (field.type === 'enum') {
          return (
            <div key={key}>
              <label className={glassLabel}>{field.label}{field.required && ' *'}</label>
              <select value={value} onChange={e => set(key, e.target.value)} className={glassSelect}>
                {(field.options ?? []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )
        }

        if (field.type === 'datetime') {
          return (
            <div key={key}>
              <label className={glassLabel}>{field.label}{field.required && ' *'}</label>
              <input type="datetime-local" value={value} onChange={e => set(key, e.target.value)} className={glassInput} />
            </div>
          )
        }

        const isTextarea = field.type === 'text'
        const dzHandlers = makeDropZoneHandlers((next) => set(key, coerceMaybeNumber(next, field.type)))
        const handleFx = () => onOpenExpression?.({
          key,
          label: field.label,
          value: String(value ?? ''),
          onApply: (next) => set(key, coerceMaybeNumber(next, field.type)),
        })

        return (
          <div key={key} className="ndv-field-group">
            <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
              <label className="ndv-field-label" style={{ marginBottom: 0 }}>
                {field.label}{field.required && ' *'}
              </label>
              {variables.length > 0 && (
                <VariablePicker
                  variables={variables}
                  onInsert={(v) => set(key, (value ? String(value) + ' ' : '') + `{{${v}}}`)}
                />
              )}
            </div>
            {isTextarea ? (
              <div className={`ndv-field-wrapper${false ? ' drag-over' : ''}`}
                onDragOver={dzHandlers.onDragOver}
                onDrop={dzHandlers.onDrop}
              >
                <textarea
                  value={value}
                  onChange={e => set(key, e.target.value)}
                  placeholder={field.placeholder ?? ''}
                  className="ndv-field-textarea"
                />
                <button className="ndv-fx-btn" style={{ top: 8, transform: 'none' }} onClick={handleFx}>fx</button>
              </div>
            ) : (
              <ExpressionInput
                value={String(value ?? '')}
                onChange={e => set(key, coerceMaybeNumber(e.target.value, field.type))}
                onFxClick={handleFx}
                placeholder={field.placeholder ?? ''}
                dropZoneHandlers={dzHandlers}
                fieldId={key}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function typeLabel(type, t) {
  const map = {
    trigger:         t('nodes.trigger'),
    action:          t('nodes.action'),
    condition:       t('nodes.condition'),
    delay:           t('nodes.delay'),
    webhook_inbound:  t('nodes.webhookInbound'),
    outbound_webhook: 'HTTP Request',
    stop:             t('nodes.stop'),
  }
  return map[type] ?? type
}
