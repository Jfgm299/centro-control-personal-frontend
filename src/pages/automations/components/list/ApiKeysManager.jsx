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
    <div style={{ maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
            🔑 {t('apiKeys.title')}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
            {t('apiKeys.description')}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{
            padding: '7px 14px', borderRadius: 10, border: 'none',
            background: '#0f172a', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + {t('apiKeys.create')}
        </button>
      </div>

      {/* Token recién creado — mostrar UNA sola vez */}
      {newToken && (
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
        }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#15803d' }}>
            ✅ {t('apiKeys.tokenOnce')}
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{
              flex: 1, padding: '6px 10px', borderRadius: 8,
              background: '#fff', border: '1px solid #bbf7d0',
              fontSize: 12, color: '#166534', wordBreak: 'break-all',
            }}>
              {newToken}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(newToken) }}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #bbf7d0',
                background: '#fff', color: '#15803d', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {t('webhook.copy')}
            </button>
          </div>
          <button
            onClick={() => setNewToken(null)}
            style={{ marginTop: 8, fontSize: 11, color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
          >
            {t('apiKeys.dismissToken')}
          </button>
        </div>
      )}

      {/* Lista de keys */}
      {isLoading && <p style={{ fontSize: 13, color: '#9ca3af' }}>Cargando...</p>}

      {!isLoading && keys.length === 0 && (
        <div style={{
          padding: '32px 20px', textAlign: 'center',
          border: '1px dashed #e5e7eb', borderRadius: 12,
        }}>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{t('apiKeys.empty')}</p>
        </div>
      )}

      {!isLoading && keys.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keys.map((key) => (
            <ApiKeyRow key={key.id} apiKey={key} onRevoke={() => revoke.mutate(key.id)} />
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

function ApiKeyRow({ apiKey, onRevoke }) {
  const { t } = useTranslation('automations')
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', background: '#fff',
      border: '1px solid #f0f0f0', borderRadius: 12,
      opacity: apiKey.is_active ? 1 : 0.5,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{apiKey.name}</span>
          {apiKey.scopes?.map(scope => (
            <span key={scope} style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
              background: '#eff6ff', color: '#1d4ed8',
            }}>
              {scope}
            </span>
          ))}
          {!apiKey.is_active && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
              background: '#fef2f2', color: '#dc2626',
            }}>
              {t('apiKeys.revoked')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
            {apiKey.key_prefix}••••••••
          </span>
          {apiKey.last_used_at && (
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              {t('apiKeys.lastUsed')}: {formatDate(apiKey.last_used_at)}
            </span>
          )}
          {apiKey.expires_at && (
            <span style={{ fontSize: 11, color: '#f59e0b' }}>
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
          style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            borderColor: confirmRevoke ? '#ef4444' : '#fca5a5',
            background:  confirmRevoke ? '#ef4444' : '#fff',
            color:       confirmRevoke ? '#fff'    : '#ef4444',
            flexShrink: 0,
          }}
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }} onClick={e => e.stopPropagation()}>

        <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
          {t('apiKeys.createTitle')}
        </h2>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'block' }}>
            {t('modal.name')}
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('apiKeys.namePlaceholder')}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', fontSize: 13,
              border: '1px solid #e5e7eb', borderRadius: 10,
              outline: 'none', color: '#111827', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8, display: 'block' }}>
            {t('apiKeys.scopes')}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {SCOPES.map(scope => {
              const active = scopes.includes(scope)
              return (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  style={{
                    padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    borderColor: active ? '#0f172a' : '#e5e7eb',
                    background:  active ? '#0f172a' : '#fff',
                    color:       active ? '#fff'    : '#6b7280',
                  }}
                >
                  {scope}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: isCreating || !name.trim() ? '#9ca3af' : '#0f172a',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: isCreating || !name.trim() ? 'not-allowed' : 'pointer',
            }}
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