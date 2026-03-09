import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { webhooksService } from '../../services/automationsApi'
import VariablePicker, { insertAtCursor } from './VariablePicker'

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

// ── WebhookInboundConfig ──────────────────────────────────────────────────────
// Panel para el nodo trigger webhook — muestra URL + botón Send Test

export function WebhookInboundConfig({ webhookToken }) {
  const { t }        = useTranslation('automations')
  const [copied, setCopied]       = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting]     = useState(false)

  const webhookUrl = webhookToken
    ? `${window.location.origin}/api/v1/automations/webhooks/in/${webhookToken}`
    : null

  const handleCopy = () => {
    if (!webhookUrl) return
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async () => {
    if (!webhookToken) return
    setTesting(true)
    setTestResult(null)
    const start = Date.now()
    try {
      await webhooksService.sendTest(webhookToken)
      setTestResult({ ok: true, ms: Date.now() - start, status: 200 })
    } catch (err) {
      setTestResult({ ok: false, error: err?.message ?? 'Error' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={labelStyle}>{t('webhook.urlLabel')}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            readOnly
            value={webhookUrl ?? '(guardar para generar URL)'}
            style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: 'monospace', background: '#f9fafb' }}
          />
          <button
            onClick={handleCopy}
            disabled={!webhookUrl}
            style={{
              padding: '0 12px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 12, fontWeight: 600,
              cursor: webhookUrl ? 'pointer' : 'not-allowed',
              color: copied ? '#15803d' : '#374151',
              flexShrink: 0,
            }}
          >
            {copied ? t('webhook.copied') : t('webhook.copy')}
          </button>
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={testing || !webhookToken}
        style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb',
          background: testing ? '#f9fafb' : '#fff',
          color: '#374151', fontSize: 13, fontWeight: 500,
          cursor: testing || !webhookToken ? 'not-allowed' : 'pointer',
          textAlign: 'left',
        }}
      >
        {testing ? `⏳ ${t('webhook.sending')}` : `🧪 ${t('webhook.sendTest')}`}
      </button>

      {testResult && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, fontSize: 12,
          background: testResult.ok ? '#f0fdf4' : '#fef2f2',
          color:      testResult.ok ? '#15803d' : '#dc2626',
          fontWeight: 500,
        }}>
          {testResult.ok
            ? t('webhook.testSuccess', { status: testResult.status, ms: testResult.ms })
            : t('webhook.testFailed',  { error: testResult.error })}
        </div>
      )}
    </div>
  )
}

// ── WebhookOutboundConfig ─────────────────────────────────────────────────────
// Panel para el nodo acción webhook saliente

const HTTP_METHODS = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']

export function WebhookOutboundConfig({ config = {}, onChange, variables = [] }) {
  const { t }    = useTranslation('automations')
  const urlRef   = useRef(null)
  const bodyRef  = useRef(null)

  const set = (key, value) => onChange({ ...config, [key]: value })

  const headers = config.headers ?? [{ key: '', value: '' }]

  const setHeader = (i, field, val) => {
    const next = headers.map((h, idx) => idx === i ? { ...h, [field]: val } : h)
    set('headers', next)
  }

  const addHeader    = () => set('headers', [...headers, { key: '', value: '' }])
  const removeHeader = (i) => set('headers', headers.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* URL */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('webhook.outboundUrl')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(urlRef, v)} />
        </div>
        <input
          ref={urlRef}
          type="url"
          value={config.url ?? ''}
          onChange={e => set('url', e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />
      </div>

      {/* Método */}
      <div>
        <label style={labelStyle}>{t('webhook.method')}</label>
        <select
          value={config.method ?? 'POST'}
          onChange={e => set('method', e.target.value)}
          style={inputStyle}
        >
          {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Headers */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('webhook.headers')}</label>
          <button onClick={addHeader} style={{
            fontSize: 11, fontWeight: 600, color: '#6366f1',
            border: 'none', background: 'none', cursor: 'pointer', padding: 0,
          }}>
            + {t('webhook.addHeader')}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {headers.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <input
                value={h.key}
                onChange={e => setHeader(i, 'key', e.target.value)}
                placeholder="Content-Type"
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                value={h.value}
                onChange={e => setHeader(i, 'value', e.target.value)}
                placeholder="application/json"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => removeHeader(i)}
                style={{
                  padding: '0 8px', borderRadius: 8,
                  border: '1px solid #fee2e2', background: '#fff',
                  color: '#ef4444', cursor: 'pointer', fontSize: 14, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('webhook.body')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(bodyRef, v)} />
        </div>
        <textarea
          ref={bodyRef}
          value={config.body ?? ''}
          onChange={e => set('body', e.target.value)}
          placeholder={'{\n  "message": "{{payload.title}}"\n}'}
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
          {t('webhook.bodyHint')}
        </div>
      </div>

    </div>
  )
}