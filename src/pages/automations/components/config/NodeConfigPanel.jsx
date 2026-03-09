import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationsStore } from '../../store/editorStore'
import VariablePicker, { insertAtCursor } from './VariablePicker'
import { ScheduleOnceConfig, ScheduleIntervalConfig } from './ScheduleConfig'
import { WebhookInboundConfig, WebhookOutboundConfig } from './WebhookConfig'

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '7px 10px', fontSize: 13,
  border: '1px solid #e5e7eb', borderRadius: 8,
  outline: 'none', color: '#111827',
  fontFamily: 'inherit', background: '#fff',
}

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: '#6b7280',
  marginBottom: 4, display: 'block',
}

const sectionStyle = {
  paddingBottom: 16, marginBottom: 16,
  borderBottom: '1px solid #f0f0f0',
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
export default function NodeConfigPanel({ node, onUpdate, onDelete, variables = [], automationId }) {
  const { t } = useTranslation('automations')
  const clearSelection = useAutomationsStore((s) => s.clearSelection)

  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!node) {
    return (
      <div style={panelWrapStyle}>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
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
    <div style={panelWrapStyle}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {typeLabel(node.type, t)}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 1 }}>
            {node.data?.label ?? node.type}
          </div>
        </div>
        <button
          onClick={() => { clearSelection(); setConfirmDelete(false) }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* ── Trigger: schedule_once ── */}
        {node.type === 'trigger' && node.data?.ref_id === 'system.schedule_once' && (
          <div style={sectionStyle}>
            <ScheduleOnceConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Trigger: schedule_interval ── */}
        {node.type === 'trigger' && node.data?.ref_id === 'system.schedule_interval' && (
          <div style={sectionStyle}>
            <ScheduleIntervalConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Trigger: webhook_inbound / nodo webhook_inbound ── */}
        {(node.type === 'webhook_inbound' ||
          (node.type === 'trigger' && node.data?.ref_id === 'system.webhook_inbound')) && (
          <div style={sectionStyle}>
            <WebhookInboundConfig webhookToken={node.data?.webhook_token} />
          </div>
        )}

        {/* ── Acción: webhook saliente ── */}
        {(node.type === 'outbound_webhook' || (node.type === 'action' && node.data?.ref_id === 'http.webhook_outbound')) && (
          <div style={sectionStyle}>
            <WebhookOutboundConfig config={config} onChange={setConfig} variables={variables} />
          </div>
        )}

        {/* ── Condición ── */}
        {node.type === 'condition' && (
          <div style={sectionStyle}>
            <ConditionConfig config={config} onChange={setConfig} variables={variables} />
          </div>
        )}

        {/* ── Delay ── */}
        {node.type === 'delay' && (
          <div style={sectionStyle}>
            <DelayConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Stop ── */}
        {node.type === 'stop' && (
          <div style={sectionStyle}>
            <StopConfig config={config} onChange={setConfig} />
          </div>
        )}

        {/* ── Acción genérica de módulo ── */}
        {node.type === 'action' && node.data?.ref_id !== 'http.webhook_outbound' && node.data?.ref_id !== 'automations_engine.outbound_webhook' && node.data?.config_schema && (
          <div style={sectionStyle}>
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
          <div style={sectionStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={node.data?.continue_on_error ?? false}
                onChange={e => onUpdate(node.id, { continue_on_error: e.target.checked })}
              />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                {t('nodes.config.continueOnError')}
              </span>
            </label>
          </div>
        )}

        {/* ── Eliminar nodo ── */}
        {node.type !== 'trigger' && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleDelete}
              onMouseLeave={() => setConfirmDelete(false)}
              style={{
                fontSize: 12, fontWeight: confirmDelete ? 700 : 500,
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid',
                borderColor: confirmDelete ? '#ef4444' : '#fca5a5',
                background:  confirmDelete ? '#ef4444' : '#fff',
                color:       confirmDelete ? '#fff'    : '#ef4444',
              }}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('condition.field')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(fieldRef, v)} />
        </div>
        <input
          ref={fieldRef}
          value={config.field ?? ''}
          onChange={e => set('field', e.target.value)}
          placeholder="payload.status"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>{t('condition.operator')}</label>
        <select value={config.operator ?? 'eq'} onChange={e => set('operator', e.target.value)} style={inputStyle}>
          {OPERATORS.map(op => (
            <option key={op} value={op}>{t(`condition.operators.${op}`)}</option>
          ))}
        </select>
      </div>
      {!hideValue && (
        <div>
          <label style={labelStyle}>{t('condition.value')}</label>
          <input
            value={config.value ?? ''}
            onChange={e => set('value', e.target.value)}
            placeholder="completed"
            style={inputStyle}
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
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>{t('delay.label')}</label>
        <input
          type="number" min={1}
          value={config.delay_value ?? ''}
          onChange={e => set('delay_value', Number(e.target.value))}
          style={inputStyle}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>&nbsp;</label>
        <select value={config.delay_unit ?? 'minutes'} onChange={e => set('delay_unit', e.target.value)} style={inputStyle}>
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
      <label style={labelStyle}>{t('nodes.stop')}</label>
      <input
        value={config.reason ?? ''}
        onChange={e => onChange({ ...config, reason: e.target.value })}
        placeholder="Motivo opcional"
        style={inputStyle}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(schema).map(([key, field]) => {
        const value = config[key] ?? field.default ?? ''

        if (field.type === 'bool') {
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!value} onChange={e => set(key, e.target.checked)} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{field.label}</span>
            </label>
          )
        }

        if (field.type === 'enum') {
          return (
            <div key={key}>
              <label style={labelStyle}>{field.label}{field.required && ' *'}</label>
              <select value={value} onChange={e => set(key, e.target.value)} style={inputStyle}>
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
              <label style={labelStyle}>{field.label}{field.required && ' *'}</label>
              <input type="datetime-local" value={value} onChange={e => set(key, e.target.value)} style={inputStyle} />
            </div>
          )
        }

        const isTextarea = field.type === 'text'
        if (!refs.current[key]) refs.current[key] = { current: null }

        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
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
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            ) : (
              <input
                ref={refs.current[key]}
                type={field.type === 'int' || field.type === 'float' ? 'number' : 'text'}
                value={value}
                onChange={e => set(key, field.type === 'int' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder ?? ''}
                style={inputStyle}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const panelWrapStyle = {
  width: 280, flexShrink: 0,
  borderLeft: '1px solid #f0f0f0',
  background: '#fff',
  display: 'flex', flexDirection: 'column',
  height: '100%', overflowY: 'hidden',
}

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