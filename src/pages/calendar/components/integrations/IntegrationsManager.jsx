import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnections, useSyncLogs, useSyncMutations } from '../../hooks/useSync'

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const inputCls  = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all bg-white text-slate-800 placeholder-gray-400'
const labelCls  = 'text-xs font-medium text-gray-500 mb-1 block'
const btnPrimary = {
  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: '#111827', color: 'white', fontSize: 13, fontWeight: 600,
  transition: 'background .15s',
}
const btnSecondary = {
  padding: '7px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
  fontWeight: 500, background: 'white', color: '#374151',
  border: '1px solid #e5e7eb', transition: 'background .15s',
}
const btnDanger = {
  ...btnSecondary, color: '#dc2626', borderColor: '#fecaca',
}

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M46.145 24.503c0-1.605-.144-3.15-.413-4.633H24v8.77h12.436c-.537 2.8-2.17 5.174-4.626 6.769v5.628h7.49c4.382-4.039 6.845-9.99 6.845-16.534z"/>
      <path fill="#34A853" d="M24 47c6.237 0 11.468-2.069 15.291-5.594l-7.49-5.814c-2.07 1.387-4.717 2.207-7.801 2.207-6.002 0-11.084-4.054-12.9-9.5H3.434v5.998C7.238 41.992 15.008 47 24 47z"/>
      <path fill="#FBBC05" d="M11.1 28.299A13.95 13.95 0 0 1 10.5 24c0-1.49.255-2.937.6-4.299v-5.998H3.434A22.98 22.98 0 0 0 1 24c0 3.714.888 7.228 2.434 10.297L11.1 28.299z"/>
      <path fill="#EA4335" d="M24 10.201c3.38 0 6.413 1.163 8.799 3.443l6.594-6.594C35.455 3.363 30.231 1 24 1 15.008 1 7.238 6.008 3.434 13.703l7.666 5.998C12.916 14.255 17.998 10.201 24 10.201z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 814 1000">
      <path fill="#1d1d1f" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663.6 0 541.8c0-207.9 135.4-318.1 268.6-318.1 70.6 0 129.5 46.4 173.5 46.4 42 0 108.2-49.2 188.8-49.2 31.3 0 112.7 3.9 170.3 71.9zm-252.4-186.7c-14.1 64.4-53 125-98.2 162.5-3.2.6-57.5.6-57.5.6 13.5-59.5 49.5-117.7 97.4-154.3 2.6-1.9 54-33.6 58.3-8.8z"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
    </svg>
  )
}

function SyncIcon({ spinning }) {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  )
}

/* ── Sync Logs ─────────────────────────────────────────────────────────────── */
function SyncLogs({ provider }) {
  const { t } = useTranslation('calendar')
  const { data: logs = [], isLoading } = useSyncLogs(provider)

  if (isLoading) return (
    <p style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>{t('status.loading')}</p>
  )
  if (!logs.length) return (
    <p style={{ fontSize: 12, color: '#9ca3af', padding: '8px 0' }}>{t('integrations.noLogs')}</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
      {logs.slice(0, 10).map(log => (
        <div key={log.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', borderRadius: 8,
          background: log.error ? '#fef2f2' : '#f9fafb',
          border: `1px solid ${log.error ? '#fecaca' : '#f3f4f6'}`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 11.5, color: log.error ? '#dc2626' : '#374151', fontWeight: 500 }}>
              {log.error
                ? `⚠ ${log.error.slice(0, 60)}`
                : `+${log.events_created} / ~${log.events_updated}`
              }
            </span>
            <span style={{ fontSize: 10.5, color: '#9ca3af' }}>
              {new Date(log.synced_at).toLocaleString()}
            </span>
          </div>
          {!log.error && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#059669',
              background: '#d1fae5', borderRadius: 5, padding: '1px 6px',
            }}>OK</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Apple Connect Form ────────────────────────────────────────────────────── */
function AppleConnectForm({ onSubmit, isLoading, onCancel }) {
  const { t } = useTranslation('calendar')
  const [form, setForm]         = useState({ username: '', password: '', sync_events: true, sync_routines: true, calendar_id: '' })
  const [calendars, setCalendars] = useState(null)   // null = no cargado, [] = sin calendarios
  const [loadingCals, setLoadingCals] = useState(false)
  const [calError, setCalError]   = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const loadCalendars = async () => {
    if (!form.username || !form.password) return
    setLoadingCals(true)
    setCalError(null)
    try {
      const { syncService } = await import('../../services/calendarService')
      const data = await syncService.appleCalendars({ username: form.username, password: form.password })
      setCalendars(data)
      const writable = data.find(c => c.writable)
      if (writable) set('calendar_id', writable.id)
    } catch {
      setCalError(t('integrations.apple.calendarLoadError'))
    } finally {
      setLoadingCals(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 0 4px' }}>
      <div>
        <label className={labelCls}>{t('integrations.apple.appleid')}</label>
        <input
          className={inputCls}
          type="email"
          placeholder="nombre@icloud.com"
          value={form.username}
          onChange={e => { set('username', e.target.value); setCalendars(null) }}
        />
      </div>
      <div>
        <label className={labelCls}>{t('integrations.apple.appPassword')}</label>
        <input
          className={inputCls}
          type="password"
          placeholder="xxxx-xxxx-xxxx-xxxx"
          value={form.password}
          onChange={e => { set('password', e.target.value); setCalendars(null) }}
        />
        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
          {t('integrations.apple.appPasswordHint')}{' '}
          <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noreferrer"
            style={{ color: '#374151', fontWeight: 600 }}>appleid.apple.com</a>
        </p>
      </div>

      {/* Paso 2: elegir calendario */}
      {calendars === null ? (
        <button
          style={{ ...btnSecondary, alignSelf: 'flex-start', opacity: (!form.username || !form.password || loadingCals) ? 0.5 : 1 }}
          disabled={!form.username || !form.password || loadingCals}
          onClick={loadCalendars}
        >
          {loadingCals ? '⏳ ' + t('status.loading') : '📂 ' + t('integrations.apple.loadCalendars')}
        </button>
      ) : (
        <div>
          <label className={labelCls}>{t('integrations.apple.chooseCalendar')}</label>
          <select
            className={inputCls}
            value={form.calendar_id}
            onChange={e => set('calendar_id', e.target.value)}
          >
            {calendars.filter(c => c.writable).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {calError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{calError}</p>}
        </div>
      )}

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 20 }}>
        {['sync_events', 'sync_routines'].map(key => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#111827', cursor: 'pointer' }} />
            {t(`integrations.sync.${key}`)}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button style={btnSecondary} onClick={onCancel}>{t('modal.cancel')}</button>
        <button
          style={{ ...btnPrimary, opacity: (!form.username || !form.password || !calendars || isLoading) ? 0.6 : 1 }}
          disabled={!form.username || !form.password || !calendars || isLoading}
          onClick={() => onSubmit(form)}
        >
          {isLoading ? t('status.saving') : t('integrations.connect')}
        </button>
      </div>
    </div>
  )
}

/* ── Provider Card ─────────────────────────────────────────────────────────── */
function ProviderCard({ provider, connection, onConnect, onDisconnect, onSync }) {
  const { t } = useTranslation('calendar')
  const [showLogs, setShowLogs]   = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [syncing, setSyncing]     = useState(false)
  const [disconnecting, setDisco] = useState(false)
  const { appleConnect }          = useSyncMutations()

  const isGoogle    = provider === 'google'
  const isConnected = !!connection

  const accentColor = isGoogle ? '#4285F4' : '#1d1d1f'

  const handleSync = async () => {
    setSyncing(true)
    try { await onSync(provider) } finally { setSyncing(false) }
  }

  const handleDisconnect = async () => {
    setDisco(true)
    try { await onDisconnect(provider) } finally { setDisco(false) }
  }

  const handleAppleSubmit = async (form) => {
    await appleConnect.mutateAsync(form)
    setShowForm(false)
  }

  return (
    <div style={{
      border: `1.5px solid ${isConnected ? accentColor + '33' : '#e5e7eb'}`,
      borderRadius: 14,
      background: isConnected ? accentColor + '05' : 'white',
      overflow: 'hidden',
      transition: 'border-color .2s',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: isConnected ? 'white' : '#f9fafb',
            border: `1px solid ${isConnected ? accentColor + '40' : '#e5e7eb'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isConnected ? '0 1px 4px rgba(0,0,0,.07)' : 'none',
          }}>
            {isGoogle ? <GoogleIcon /> : <AppleIcon />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
                {t(`integrations.${provider}.name`)}
              </span>
              {isConnected && (
                <span style={{
                  fontSize: 10.5, fontWeight: 600, color: '#059669',
                  background: '#d1fae5', borderRadius: 20, padding: '1px 7px',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <CheckIcon /> {t('integrations.connected')}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
              {isConnected
                ? connection.last_synced_at
                  ? `${t('integrations.lastSync')} ${new Date(connection.last_synced_at).toLocaleString()}`
                  : t('integrations.neverSynced')
                : t(`integrations.${provider}.description`)
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isConnected ? (
            <>
              <button
                style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={handleSync}
                disabled={syncing}
              >
                <SyncIcon spinning={syncing} />
                {syncing ? t('integrations.syncing') : t('integrations.syncNow')}
              </button>
              <button style={btnDanger} onClick={handleDisconnect} disabled={disconnecting}>
                {disconnecting ? '…' : t('integrations.disconnect')}
              </button>
            </>
          ) : (
            <button
              style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 7 }}
              onClick={() => isGoogle ? onConnect() : setShowForm(f => !f)}
            >
              {isGoogle ? <GoogleIcon /> : <AppleIcon />}
              {t('integrations.connect')}
            </button>
          )}
        </div>
      </div>

      {/* Apple form */}
      {!isGoogle && !isConnected && showForm && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f3f4f6' }}>
          <AppleConnectForm
            onSubmit={handleAppleSubmit}
            isLoading={appleConnect.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Connected details */}
      {isConnected && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 18px' }}>
          {/* Sync toggles info */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {['sync_events', 'sync_routines'].map(key => (
              <span key={key} style={{
                fontSize: 11.5, fontWeight: 500,
                color: connection[key] ? '#374151' : '#9ca3af',
                background: connection[key] ? '#f3f4f6' : 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: 6, padding: '2px 8px',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {connection[key] ? '✓' : '○'} {t(`integrations.sync.${key}`)}
              </span>
            ))}
          </div>

          {/* Logs toggle */}
          <button
            onClick={() => setShowLogs(v => !v)}
            style={{ ...btnSecondary, fontSize: 12, padding: '5px 10px' }}
          >
            {showLogs ? t('integrations.hideLogs') : t('integrations.showLogs')}
          </button>

          {showLogs && (
            <div style={{ marginTop: 10 }}>
              <SyncLogs provider={provider} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function IntegrationsManager() {
  const { t } = useTranslation('calendar')
  const { data: connections = [], isLoading, error } = useConnections()
  const { googleConnect, disconnect, sync } = useSyncMutations()

  const getConnection = (provider) => connections.find(c => c.provider === provider && c.is_active)

  const handleGoogleConnect = async () => {
    await googleConnect.mutateAsync()
  }

  if (isLoading) return (
    <div style={{ padding: 24, color: '#6b7280', fontSize: 14 }}>{t('status.loading')}</div>
  )

  if (error) return (
    <div style={{ padding: 24, color: '#dc2626', fontSize: 14 }}>{t('errors.loadConnections')}</div>
  )

  return (
    <div style={{ maxWidth: 660, padding: '8px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
          {t('integrations.title')}
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {t('integrations.subtitle')}
        </p>
      </div>

      {/* Provider cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ProviderCard
          provider="google"
          connection={getConnection('google')}
          onConnect={handleGoogleConnect}
          onDisconnect={(p) => disconnect.mutateAsync(p)}
          onSync={(p) => sync.mutateAsync(p)}
        />
        <ProviderCard
          provider="apple"
          connection={getConnection('apple')}
          onConnect={() => {}}
          onDisconnect={(p) => disconnect.mutateAsync(p)}
          onSync={(p) => sync.mutateAsync(p)}
        />
      </div>

      {/* Info box */}
      <div style={{
        marginTop: 16, padding: '12px 14px', borderRadius: 10,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        fontSize: 12.5, color: '#64748b', lineHeight: 1.6,
      }}>
        ℹ️ {t('integrations.syncInfo')}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}