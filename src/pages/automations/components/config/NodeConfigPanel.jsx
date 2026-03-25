import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'
import VariablePicker, { insertAtCursor } from './VariablePicker'
import { ScheduleOnceConfig, ScheduleIntervalConfig } from './ScheduleConfig'
import { WebhookInboundConfig, WebhookOutboundConfig } from './WebhookConfig'

const glassInput = 'w-full px-3 py-2 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all'
const glassSelect = glassInput + ' appearance-none'
const glassLabel = 'text-white/60 text-sm mb-1 block'
const glassSectionLabel = 'text-white/40 text-xs font-semibold uppercase tracking-wider mb-2'

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
export default function NodeConfigPanel({ node, onUpdate, onDelete, variables = [], automationId }) {
  const { t } = useTranslation('automations')
  const clearSelection = useAutomationsStore((s) => s.clearSelection)

  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!node) {
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── Trigger: schedule_once ── */}
        {node.type === 'trigger' && node.data?.ref_id === 'system.schedule_once' && (
          <div className="pb-4 mb-0 border-b border-white/10">
            <ScheduleOnceConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Trigger: schedule_interval ── */}
        {node.type === 'trigger' && node.data?.ref_id === 'system.schedule_interval' && (
          <div className="pb-4 border-b border-white/10">
            <ScheduleIntervalConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Trigger: webhook_inbound / nodo webhook_inbound ── */}
        {(node.type === 'webhook_inbound' ||
          (node.type === 'trigger' && node.data?.ref_id === 'system.webhook_inbound')) && (
          <div className="pb-4 border-b border-white/10">
            <WebhookInboundConfig webhookToken={node.data?.webhook_token} />
          </div>
        )}

        {/* ── Acción: webhook saliente ── */}
        {(node.type === 'outbound_webhook' || (node.type === 'action' && node.data?.ref_id === 'http.webhook_outbound')) && (
          <div className="pb-4 border-b border-white/10">
            <WebhookOutboundConfig config={config} onChange={setConfig} variables={variables} />
          </div>
        )}

        {/* ── Condición ── */}
        {node.type === 'condition' && (
          <div className="pb-4 border-b border-white/10">
            <ConditionConfig config={config} onChange={setConfig} variables={variables} />
          </div>
        )}

        {/* ── Delay ── */}
        {node.type === 'delay' && (
          <div className="pb-4 border-b border-white/10">
            <DelayConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Stop ── */}
        {node.type === 'stop' && (
          <div className="pb-4 border-b border-white/10">
            <StopConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Acción genérica de módulo ── */}
        {node.type === 'action' && node.data?.ref_id !== 'http.webhook_outbound' && node.data?.ref_id !== 'automations_engine.outbound_webhook' && node.data?.config_schema && (
          <div className="pb-4 border-b border-white/10">
            <GenericActionConfig
              schema={node.data.config_schema}
              config={config}
              onChange={setConfig}
              variables={variables}
            />
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
    </div>
  )
}

// ── Sub-configs ───────────────────────────────────────────────────────────────

function ConditionConfig({ config, onChange, variables }) {
  const { t } = useTranslation('automations')
  const fieldRef = useRef(null)
  const set = (k, v) => onChange({ ...config, [k]: v })

  const OPERATORS = ['eq', 'neq', 'gt', 'lt', 'contains', 'exists', 'not_exists']
  const hideValue = ['exists', 'not_exists'].includes(config.operator)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className={glassLabel + ' mb-0'}>{t('condition.field')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(fieldRef, v)} />
        </div>
        <input
          ref={fieldRef}
          value={config.field ?? ''}
          onChange={e => set('field', e.target.value)}
          placeholder="payload.status"
          className={glassInput}
        />
      </div>
      <div>
        <label className={glassLabel}>{t('condition.operator')}</label>
        <select value={config.operator ?? 'eq'} onChange={e => set('operator', e.target.value)} className={glassSelect}>
          {OPERATORS.map(op => (
            <option key={op} value={op}>{t(`condition.operators.${op}`)}</option>
          ))}
        </select>
      </div>
      {!hideValue && (
        <div>
          <label className={glassLabel}>{t('condition.value')}</label>
          <input
            value={config.value ?? ''}
            onChange={e => set('value', e.target.value)}
            placeholder="completed"
            className={glassInput}
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
      <div className="flex-1">
        <label className={glassLabel}>{t('delay.label')}</label>
        <input
          type="number" min={1}
          value={config.delay_value ?? ''}
          onChange={e => set('delay_value', Number(e.target.value))}
          className={glassInput}
        />
      </div>
      <div className="flex-1">
        <label className={glassLabel}>&nbsp;</label>
        <select value={config.delay_unit ?? 'minutes'} onChange={e => set('delay_unit', e.target.value)} className={glassSelect}>
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
    <div>
      <label className={glassLabel}>{t('nodes.stop')}</label>
      <input
        value={config.reason ?? ''}
        onChange={e => onChange({ ...config, reason: e.target.value })}
        placeholder={t('nodes.stopReasonPlaceholder')}
        className={glassInput}
      />
    </div>
  )
}

/**
 * Renderiza los campos de un nodo acción basándose en su config_schema.
 * Soporta tipos: string, text, int, float, bool, enum, datetime.
 */
function GenericActionConfig({ schema, config, onChange, variables }) {
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
        if (!refs.current[key]) refs.current[key] = { current: null }

        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className={glassLabel + ' mb-0'}>
                {field.label}{field.required && ' *'}
              </label>
              {variables.length > 0 && (
                <VariablePicker
                  variables={variables}
                  onInsert={(v) => insertAtCursor(refs.current[key], v)}
                />
              )}
            </div>
            {isTextarea ? (
              <textarea
                ref={refs.current[key]}
                value={value}
                onChange={e => set(key, e.target.value)}
                placeholder={field.placeholder ?? ''}
                rows={3}
                className={glassInput + ' resize-y'}
              />
            ) : (
              <input
                ref={refs.current[key]}
                type={field.type === 'int' || field.type === 'float' ? 'number' : 'text'}
                value={value}
                onChange={e => set(key, field.type === 'int' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder ?? ''}
                className={glassInput}
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
