import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ParameterPill from './ParameterPill'

function HighlightedExpression({ value }) {
  const parts = String(value ?? '').split(/(\{\{[^}]+\}\})/g)
  return (
    <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-white/80">
      {parts.map((part, idx) => {
        if (/^\{\{[^}]+\}\}$/.test(part)) {
          return (
            <span key={`${part}-${idx}`} className="text-amber-300 bg-amber-500/15 px-0.5 rounded">
              {part}
            </span>
          )
        }
        return <span key={`${part}-${idx}`}>{part}</span>
      })}
    </pre>
  )
}

function groupVariables(variables) {
  return (variables ?? []).reduce((acc, variable) => {
    const path = variable?.path ?? ''
    const key = path.startsWith('payload.') ? 'payload' : path.startsWith('vars.') ? 'vars' : 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(variable)
    return acc
  }, {})
}

function resolvePreviewValue(previewContext, path) {
  if (!previewContext || !path) return undefined
  const normalized = path.replace(/^payload\./, '')
  const segments = normalized.split('.').filter(Boolean)
  let cursor = previewContext
  for (const segment of segments) {
    if (cursor == null || typeof cursor !== 'object' || !(segment in cursor)) return undefined
    cursor = cursor[segment]
  }
  return cursor
}

export default function ExpressionEditorModal({
  isOpen,
  title,
  value,
  variables = [],
  previewContext = {},
  onApply,
  onClose,
}) {
  const { t } = useTranslation('automations')
  const [draft, setDraft] = useState('')
  const editorRef = useRef(null)

  useEffect(() => {
    if (isOpen) setDraft(value ?? '')
  }, [isOpen, value])

  const groupedVariables = useMemo(() => groupVariables(variables), [variables])

  const insertTokenAtCursor = (token) => {
    const el = editorRef.current
    if (!el) {
      setDraft((prev) => `${prev}${token}`)
      return
    }
    const start = el.selectionStart ?? draft.length
    const end = el.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + token + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + token.length
      el.setSelectionRange(pos, pos)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[12000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[90vh] bg-white/10 border border-white/20 rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-base m-0">{title || t('expressionEditorModal.title', { defaultValue: 'Expression Editor' })}</h2>
            <p className="m-0 text-xs text-white/40">{t('expressionEditorModal.subtitle', { defaultValue: 'Use variables and expressions with {{ }}' })}</p>
          </div>
          <button type="button" onClick={onClose} className="border border-white/10 bg-black/20 hover:bg-white/10 text-white/60 hover:text-white rounded-lg px-2 py-1">
            x
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] min-h-[430px] max-h-[calc(90vh-126px)]">
          <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
            <label className="block text-white/55 text-xs uppercase tracking-wider mb-1">{t('expressionEditorModal.expressionLabel', { defaultValue: 'Expression' })}</label>
            <textarea
              ref={editorRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[180px] box-border px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 font-mono text-xs leading-relaxed"
              spellCheck={false}
            />

            <div className="mt-3">
              <label className="block text-white/55 text-xs uppercase tracking-wider mb-1">{t('expressionEditorModal.syntaxPreviewLabel', { defaultValue: 'Syntax preview' })}</label>
              <div className="bg-black/35 border border-white/10 rounded-xl p-3 min-h-[120px]">
                <HighlightedExpression value={draft} />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-white/55 text-xs uppercase tracking-wider mb-1">{t('expressionEditorModal.runtimeContextLabel', { defaultValue: 'Runtime context' })}</label>
              <pre className="m-0 bg-black/30 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-white/60 overflow-auto max-h-[140px]">{JSON.stringify(previewContext ?? {}, null, 2)}</pre>
            </div>
          </div>

          <div className="p-4 overflow-y-auto">
            <div className="text-white/55 text-xs uppercase tracking-wider mb-2">{t('expressionEditorModal.variableBrowserLabel', { defaultValue: 'Variable browser' })}</div>
            <div className="space-y-3">
              {['payload', 'vars', 'other'].map((groupKey) => {
                const items = groupedVariables[groupKey] ?? []
                if (!items.length) return null
                const groupLabel = groupKey === 'payload'
                  ? t('expressionEditorModal.groupPayload', { defaultValue: 'payload' })
                  : groupKey === 'vars'
                    ? t('expressionEditorModal.groupVars', { defaultValue: 'vars' })
                    : t('expressionEditorModal.groupOther', { defaultValue: 'other' })
                return (
                  <div key={groupKey}>
                    <div className="text-[11px] text-white/35 uppercase tracking-wider mb-1">{groupLabel}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((variable) => (
                        <ParameterPill
                          key={variable.path}
                          variable={variable}
                          previewValue={resolvePreviewValue(previewContext, variable.path)}
                          onInsert={(token) => insertTokenAtCursor(token)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-black/20 hover:bg-black/30 border border-white/10 text-white/70 rounded-xl px-3 py-1.5 text-sm">
            {t('expressionEditorModal.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            onClick={() => onApply?.(draft)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-3 py-1.5 text-sm font-medium"
          >
            {t('expressionEditorModal.apply', { defaultValue: 'Apply' })}
          </button>
        </div>
      </div>
    </div>
  )
}
