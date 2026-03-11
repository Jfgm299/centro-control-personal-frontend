import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnections, useSyncLogs, useSyncMutations } from '../../hooks/useSync'
import clsx from 'clsx'

const inputCls = 'w-full px-4 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all shadow-inner'
const labelCls = 'text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block'

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
    <svg width="18" height="20" viewBox="0 0 814 1000" className="fill-white">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663.6 0 541.8c0-207.9 135.4-318.1 268.6-318.1 70.6 0 129.5 46.4 173.5 46.4 42 0 108.2-49.2 188.8-49.2 31.3 0 112.7 3.9 170.3 71.9zm-252.4-186.7c-14.1 64.4-53 125-98.2 162.5-3.2.6-57.5.6-57.5.6 13.5-59.5 49.5-117.7 97.4-154.3 2.6-1.9 54-33.6 58.3-8.8z"/>
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
      className={clsx(spinning && "animate-spin")}>
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
    <p className="text-xs text-white/30 py-2 italic">{t('status.loading')}</p>
  )
  if (!logs.length) return (
    <p className="text-xs text-white/30 py-2 italic">{t('integrations.noLogs')}</p>
  )

  return (
    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto no-scrollbar pt-2 border-t border-white/5">
      {logs.slice(0, 10).map(log => (
        <div key={log.id} className={clsx(
          "flex items-center justify-between px-3 py-2 rounded-xl border backdrop-blur-sm shadow-inner",
          log.error ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
        )}>
          <div className="flex flex-col gap-0.5">
            <span className={clsx(
              "text-xs font-bold",
              log.error ? "text-red-300" : "text-white/80"
            )}>
              {log.error
                ? `⚠ ${log.error.slice(0, 60)}`
                : `+${log.events_created} / ~${log.events_updated}`
              }
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              {new Date(log.synced_at).toLocaleString()}
            </span>
          </div>
          {!log.error && (
            <span className="text-[9px] font-black uppercase text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-md border border-green-400/20 shadow-sm">OK</span>
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
  const [calendars, setCalendars] = useState(null)
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
    <div className="flex flex-col gap-5 py-4">
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
        <p className="text-[10px] text-white/40 mt-2 font-medium leading-relaxed italic">
          {t('integrations.apple.appPasswordHint')}{' '}
          <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 font-black decoration-dotted underline">appleid.apple.com</a>
        </p>
      </div>

      {/* Paso 2: elegir calendario */}
      {calendars === null ? (
        <button
          className={clsx(
            "self-start px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            (!form.username || !form.password || loadingCals) ? "opacity-30" : "hover:bg-white/10 text-white"
          )}
          disabled={!form.username || !form.password || loadingCals}
          onClick={loadCalendars}
        >
          {loadingCals ? '⏳ ' + t('status.loading') : '📂 ' + t('integrations.apple.loadCalendars')}
        </button>
      ) : (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <label className={labelCls}>{t('integrations.apple.chooseCalendar')}</label>
          <div className="relative">
            <select
              className={inputCls}
              value={form.calendar_id}
              onChange={e => set('calendar_id', e.target.value)}
            >
              {calendars.filter(c => c.writable).map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {calError && <p className="text-xs font-bold text-red-400 mt-1">{calError}</p>}
        </div>
      )}

      {/* Toggles */}
      <div className="flex gap-6">
        {['sync_events', 'sync_routines'].map(key => (
          <label key={key} className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => set(key, e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-white/20 bg-white/5 transition-all checked:bg-white/20 checked:border-white/40 focus:outline-none"
              />
              <svg className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{t(`integrations.sync.${key}`)}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        <button className="px-5 py-2 text-sm font-bold text-white/50 hover:text-white transition-all" onClick={onCancel}>{t('modal.cancel')}</button>
        <button
          className={clsx(
            "px-6 py-2 bg-white/10 text-white text-sm font-black uppercase tracking-wider rounded-xl border border-white/20 hover:bg-white/20 transition-all shadow-lg",
            (!form.username || !form.password || !calendars || isLoading) && "opacity-40 cursor-not-allowed"
          )}
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
    <div className={clsx(
      "rounded-3xl border transition-all duration-300 overflow-hidden",
      isConnected 
        ? "bg-white/10 border-white/20 shadow-xl" 
        : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30 shadow-inner"
    )}>
      {/* Header */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-105",
            isConnected ? "bg-white border-white/30" : "bg-black/20 border-white/10"
          )}>
            {isGoogle ? <GoogleIcon /> : <AppleIcon />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-white leading-none">
                {t(`integrations.${provider}.name`)}
              </span>
              {isConnected && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-400/20 text-green-300 text-[10px] font-black uppercase border border-green-400/20 shadow-sm">
                  <CheckIcon /> {t('integrations.connected')}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-white/40 mt-1 uppercase tracking-tight">
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
        <div className="flex gap-2 items-center">
          {isConnected ? (
            <>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10"
                onClick={handleSync}
                disabled={syncing}
              >
                <SyncIcon spinning={syncing} />
                {syncing ? t('integrations.syncing') : t('integrations.syncNow')}
              </button>
              <button 
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold rounded-xl transition-all border border-red-500/20"
                onClick={handleDisconnect} 
                disabled={disconnecting}
              >
                {disconnecting ? '…' : t('integrations.disconnect')}
              </button>
            </>
          ) : (
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all border border-white/20 shadow-lg"
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
        <div className="px-5 pb-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
          <AppleConnectForm
            onSubmit={handleAppleSubmit}
            isLoading={appleConnect.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Connected details */}
      {isConnected && (
        <div className="px-5 py-4 bg-black/20 border-t border-white/10 flex flex-col gap-4">
          {/* Sync toggles info */}
          <div className="flex flex-wrap gap-2">
            {['sync_events', 'sync_routines'].map(key => (
              <span key={key} className={clsx(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                connection[key] ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/20 border-white/5"
              )}>
                {connection[key] ? '✓' : '○'} {t(`integrations.sync.${key}`)}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLogs(v => !v)}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
            >
              {showLogs ? t('integrations.hideLogs') : t('integrations.showLogs')}
            </button>
          </div>

          {showLogs && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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
    <div className="flex items-center justify-center py-20 text-white/30">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
      <p className="text-sm font-bold text-red-300">{t('errors.loadConnections')}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white drop-shadow-md">
          {t('integrations.title')}
        </h2>
        <p className="text-sm font-medium text-white/40 mt-1 italic">
          {t('integrations.subtitle')}
        </p>
      </div>

      {/* Provider cards */}
      <div className="flex flex-col gap-4">
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
      <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm shadow-xl flex gap-4">
        <span className="text-2xl drop-shadow-md">ℹ️</span>
        <p className="text-xs font-bold text-indigo-200/70 leading-relaxed uppercase tracking-tight">
          {t('integrations.syncInfo')}
        </p>
      </div>
    </div>
  )
}