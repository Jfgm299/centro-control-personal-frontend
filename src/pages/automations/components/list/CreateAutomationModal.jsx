import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationMutations } from '../../hooks/useAutomationMutations'

const DEFAULT_FLOW = {
  nodes: [
    {
      id:   'trigger_1',
      type: 'trigger',
      config: { trigger_id: 'system.manual' },
      continue_on_error: false,
      position: { x: 250, y: 100 },
    },
  ],
  edges: [],
}

export default function CreateAutomationModal({ isOpen, onClose, onCreated }) {
  const { t } = useTranslation('automations')
  const { create } = useAutomationMutations()

  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [error, setError]         = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!name.trim()) { setError(t('modal.name')); return }
    setError('')
    try {
      const result = await create.mutateAsync({
        name:         name.trim(),
        description:  description.trim() || null,
        flow:         DEFAULT_FLOW,
        trigger_type: 'module_event',
        is_active:    false,
      })
      setName('')
      setDesc('')
      onCreated?.(result)
      onClose()
    } catch {
      setError(t('error.saveFailed'))
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>
          {t('modal.createTitle')}
        </h2>

        {/* Nombre */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4, display: 'block' }}>
            {t('modal.name')}
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('modal.namePlaceholder')}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', fontSize: 13,
              border: '1px solid #e5e7eb', borderRadius: 10,
              outline: 'none', color: '#111827',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4, display: 'block' }}>
            {t('modal.description')}
          </label>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder={t('modal.descriptionPlaceholder')}
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', fontSize: 13,
              border: '1px solid #e5e7eb', borderRadius: 10,
              outline: 'none', color: '#111827', resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{error}</p>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}>
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={create.isPending || !name.trim()}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: create.isPending || !name.trim() ? '#9ca3af' : '#0f172a',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: create.isPending || !name.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {create.isPending ? t('modal.creating') : t('modal.create')}
          </button>
        </div>
      </div>
    </div>
  )
}