import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { webhooksService } from '../../services/automationsApi'
import VariablePicker, { insertAtCursor } from './VariablePicker'

const glassInput = 'w-full px-3 py-2 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all'
const glassSelect = glassInput + ' appearance-none'
const glassLabel = 'text-white/60 text-sm mb-1 block'

// Helper: drag-drop variable insertion for text inputs / textareas
function makeDragHandlers(onChange) {
  return {
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      const v = e.dataTransfer.getData('variable')
      if (!v) return
      const el = e.currentTarget
      const start = el.selectionStart ?? el.value.length
      const end   = el.selectionEnd   ?? el.value.length
      const newVal = el.value.slice(0, start) + '{{' + v + '}}' + el.value.slice(end)
      onChange(newVal)
    },
  }
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
    <div className="flex flex-col gap-3">
      <div>
        <label className={glassLabel}>{t('webhook.urlLabel')}</label>
        <div className="flex gap-1.5">
          <input
            readOnly
            value={webhookUrl ?? t('webhook.urlPendingSave')}
            className={glassInput + ' flex-1 !text-xs font-mono'}
          />
          <button
            onClick={handleCopy}
            disabled={!webhookUrl}
            className={`bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white text-xs rounded-lg px-2 py-1 shrink-0 transition-all ${
              !webhookUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${copied ? '!text-emerald-400' : ''}`}
          >
            {copied ? t('webhook.copied') : t('webhook.copy')}
          </button>
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={testing || !webhookToken}
        className={`bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all active:scale-95 text-left ${
          (testing || !webhookToken) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {testing ? `⏳ ${t('webhook.sending')}` : `🧪 ${t('webhook.sendTest')}`}
      </button>

      {testResult && (
        <div className={`px-3 py-2 rounded-xl text-xs font-medium border ${
          testResult.ok
            ? 'bg-emerald-500/15 border-emerald-400/25 text-emerald-400'
            : 'bg-red-500/15 border-red-400/25 text-red-400'
        }`}>
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
    <div className="flex flex-col gap-3.5">

      {/* URL */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <div className="flex justify-between items-center mb-1">
          <label className={glassLabel + ' mb-0'}>{t('webhook.outboundUrl')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(urlRef, v)} />
        </div>
        <input
          ref={urlRef}
          type="url"
          value={config.url ?? ''}
          onChange={e => set('url', e.target.value)}
          placeholder="https://..."
          className={glassInput}
          {...makeDragHandlers(v => set('url', v))}
        />
      </div>

      {/* Método */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <label className={glassLabel}>{t('webhook.method')}</label>
        <select
          value={config.method ?? 'POST'}
          onChange={e => set('method', e.target.value)}
          className={glassSelect}
        >
          {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Headers */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <div className="flex justify-between items-center mb-2">
          <label className={glassLabel + ' mb-0'}>{t('webhook.headers')}</label>
          <button
            onClick={addHeader}
            className="text-xs font-semibold text-white/50 hover:text-white/80 border-none bg-transparent cursor-pointer p-0 transition-colors"
          >
            + {t('webhook.addHeader')}
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-1.5">
              <input
                value={h.key}
                onChange={e => setHeader(i, 'key', e.target.value)}
                placeholder="Content-Type"
                className={glassInput + ' flex-1'}
                {...makeDragHandlers(v => setHeader(i, 'key', v))}
              />
              <input
                value={h.value}
                onChange={e => setHeader(i, 'value', e.target.value)}
                placeholder="application/json"
                className={glassInput + ' flex-1'}
                {...makeDragHandlers(v => setHeader(i, 'value', v))}
              />
              <button
                onClick={() => removeHeader(i)}
                className="px-2 rounded-xl border border-red-400/30 bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer text-sm shrink-0 transition-all"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/[0.08]">
        <div className="flex justify-between items-center mb-1">
          <label className={glassLabel + ' mb-0'}>{t('webhook.body')}</label>
          <VariablePicker variables={variables} onInsert={(v) => insertAtCursor(bodyRef, v)} />
        </div>
        <textarea
          ref={bodyRef}
          value={config.body ?? ''}
          onChange={e => set('body', e.target.value)}
          placeholder={'{\n  "message": "{{payload.title}}"\n}'}
          rows={5}
          className={glassInput + ' resize-y font-mono !text-xs'}
          {...makeDragHandlers(v => set('body', v))}
        />
        <div className="text-white/30 text-xs mt-1">
          {t('webhook.bodyHint')}
        </div>
      </div>

    </div>
  )
}
