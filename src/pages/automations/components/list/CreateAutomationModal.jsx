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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {t('modal.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg p-1.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">

          {/* Nombre */}
          <div className="mb-4">
            <label className="text-white/60 text-sm font-medium mb-1.5 block">
              {t('modal.name')}
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t('modal.namePlaceholder')}
              className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label className="text-white/60 text-sm font-medium mb-1.5 block">
              {t('modal.description')}
            </label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder={t('modal.descriptionPlaceholder')}
              rows={2}
              className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white rounded-xl px-4 py-2.5 text-sm transition-all"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={create.isPending || !name.trim()}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${create.isPending || !name.trim() ? 'bg-white/10 border border-white/10 text-white/30 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'}`}
          >
            {create.isPending ? t('modal.creating') : t('modal.create')}
          </button>
        </div>
      </div>
    </div>
  )
}
