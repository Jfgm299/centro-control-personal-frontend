import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const BASE = '/api/v1/automations/api-keys'

// ── Service ───────────────────────────────────────────────────────────────────

const apiKeysService = {
  async getAll()     { const { data } = await api.get(BASE);         return data },
  async create(body) { const { data } = await api.post(BASE, body);  return data },
  async revoke(id)   { await api.delete(`${BASE}/${id}`) },
}

// ── Hook ──────────────────────────────────────────────────────────────────────

function useApiKeys() {
  return useQuery({ queryKey: ['automations', 'api-keys'], queryFn: apiKeysService.getAll })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ApiKeysManager() {
  const { t }  = useTranslation('automations')
  const qc     = useQueryClient()
  const { data: keys = [], isLoading } = useApiKeys()

  const [createOpen, setCreateOpen] = useState(false)
  const [newToken, setNewToken]     = useState(null)   // token mostrado UNA sola vez

  const invalidate = () => qc.invalidateQueries({ queryKey: ['automations', 'api-keys'] })

  const create = useMutation({
    mutationFn: apiKeysService.create,
    onSuccess: (data) => {
      setNewToken(data.token)   // guardar el token antes de que desaparezca
      invalidate()
    },
  })

  const revoke = useMutation({
    mutationFn: apiKeysService.revoke,
    onSuccess:  invalidate,
  })

  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-white/85 font-semibold text-sm m-0">
            🔑 {t('apiKeys.title')}
          </h2>
          <p className="text-white/40 text-xs mt-1 mb-0">
            {t('apiKeys.description')}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex-shrink-0"
        >
          + {t('apiKeys.create')}
        </button>
      </div>

      {/* Token recién creado — mostrar UNA sola vez */}
      {newToken && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl">
          <p className="text-emerald-400 text-xs font-semibold mb-2">
            ✅ {t('apiKeys.tokenOnce')}
          </p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 bg-black/40 border border-white/15 rounded-xl font-mono text-xs text-green-400/80 p-3 break-all">
              {newToken}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(newToken) }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 flex-shrink-0"
            >
              {t('webhook.copy')}
            </button>
          </div>
          <button
            onClick={() => setNewToken(null)}
            className="mt-2 text-white/30 hover:text-white/60 text-xs transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            {t('apiKeys.dismissToken')}
          </button>
        </div>
      )}

      {/* Lista de keys */}
      {isLoading && <p className="text-white/40 text-sm">{t('status.loading')}</p>}

      {!isLoading && keys.length === 0 && (
        <div className="py-8 text-center bg-black/20 border border-white/10 rounded-2xl">
          <p className="text-white/30 text-sm m-0">{t('apiKeys.empty')}</p>
        </div>
      )}

      {!isLoading && keys.length > 0 && (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
          {keys.map((key, idx) => (
            <ApiKeyRow
              key={key.id}
              apiKey={key}
              onRevoke={() => revoke.mutate(key.id)}
              isLast={idx === keys.length - 1}
            />
          ))}
        </div>
      )}

      {/* Modal crear */}
      {createOpen && (
        <CreateApiKeyModal
          onClose={() => setCreateOpen(false)}
          onCreate={(body) => create.mutateAsync(body)}
          isCreating={create.isPending}
        />
      )}
    </div>
  )
}

// ── ApiKeyRow ─────────────────────────────────────────────────────────────────

function ApiKeyRow({ apiKey, onRevoke, isLast }) {
  const { t } = useTranslation('automations')
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/8' : ''} ${!apiKey.is_active ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white/70 text-sm font-semibold">{apiKey.name}</span>
          {apiKey.scopes?.map(scope => (
            <span key={scope} className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-400/20">
              {scope}
            </span>
          ))}
          {!apiKey.is_active && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-400/20">
              {t('apiKeys.revoked')}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <span className="text-white/40 text-xs font-mono">
            {apiKey.key_prefix}••••••••
          </span>
          {apiKey.last_used_at && (
            <span className="text-white/40 text-xs">
              {t('apiKeys.lastUsed')}: {formatDate(apiKey.last_used_at)}
            </span>
          )}
          {apiKey.expires_at && (
            <span className="text-amber-400/70 text-xs">
              {t('apiKeys.expires')}: {formatDate(apiKey.expires_at)}
            </span>
          )}
        </div>
      </div>

      {apiKey.is_active && (
        <button
          onClick={() => {
            if (!confirmRevoke) { setConfirmRevoke(true); return }
            onRevoke()
          }}
          onMouseLeave={() => setConfirmRevoke(false)}
          className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${confirmRevoke ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400' : 'bg-black/20 hover:bg-black/40 border border-white/10 text-white/70 hover:text-white'}`}
        >
          {confirmRevoke ? t('apiKeys.confirmRevoke') : t('apiKeys.revoke')}
        </button>
      )}
    </div>
  )
}

// ── CreateApiKeyModal ─────────────────────────────────────────────────────────

const SCOPES = ['trigger', 'read']

function CreateApiKeyModal({ onClose, onCreate, isCreating }) {
  const { t } = useTranslation('automations')

  const [name, setName]       = useState('')
  const [scopes, setScopes]   = useState(['trigger'])
  const [error, setError]     = useState('')

  const toggleScope = (scope) => {
    setScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError(t('modal.name')); return }
    if (!scopes.length) { setError(t('apiKeys.scopeRequired')); return }
    setError('')
    try {
      await onCreate({ name: name.trim(), scopes })
      onClose()
    } catch {
      setError(t('error.saveFailed'))
    }
  }

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
            {t('apiKeys.createTitle')}
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
          <div className="mb-4">
            <label className="text-white/60 text-sm font-medium mb-1.5 block">
              {t('modal.name')}
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('apiKeys.namePlaceholder')}
              className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="text-white/60 text-sm font-medium mb-2 block">
              {t('apiKeys.scopes')}
            </label>
            <div className="flex gap-2">
              {SCOPES.map(scope => {
                const active = scopes.includes(scope)
                return (
                  <button
                    key={scope}
                    onClick={() => toggleScope(scope)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${active ? 'bg-white/20 border-white/30 text-white' : 'bg-black/20 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`}
                  >
                    {scope}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
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
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${isCreating || !name.trim() ? 'bg-white/10 border border-white/10 text-white/30 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'}`}
          >
            {isCreating ? '...' : t('apiKeys.create')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}
