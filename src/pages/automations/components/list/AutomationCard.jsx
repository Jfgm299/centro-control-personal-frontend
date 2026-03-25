import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutomationMutations } from '../../hooks/useAutomationMutations'

const TRIGGER_ICONS = {
  manual:            '▶️',
  schedule_once:     '🕐',
  schedule_interval: '🔁',
  webhook_inbound:   '🔗',
  module_event:      '📡',
}

function formatLastRun(dateStr, t) {
  if (!dateStr) return t('list.never')
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)   return t('card.now')
  if (diffMin < 60)  return t('card.agoMinutes', { count: diffMin })
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)    return t('card.agoHours', { count: diffH })
  const diffD = Math.floor(diffH / 24)
  return t('card.agoDays', { count: diffD })
}

export default function AutomationCard({ automation, onEdit, onImportFile, isMobile = false }) {
  const { t } = useTranslation('automations')
  const { toggleActive, duplicate, remove, exportFlow } = useAutomationMutations()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const triggerIcon = TRIGGER_ICONS[automation.trigger_type] ?? '⚡'

  const handleToggle = (e) => {
    e.stopPropagation()
    toggleActive.mutate({ id: automation.id, is_active: !automation.is_active })
  }

  const handleDuplicate = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    duplicate.mutate(automation.id)
  }

  const handleExport = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    exportFlow(automation)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (!confirmDelete) { setConfirmDelete(true); return }
    setMenuOpen(false)
    remove.mutate(automation.id)
  }

  return (
    <div
      onClick={() => onEdit(automation)}
      className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl hover:border-white/25 transition-all shadow-lg shadow-black/20 cursor-pointer relative flex items-center gap-3.5"
      style={{ padding: isMobile ? '14px 16px' : '16px 20px' }}
    >
      {/* Icono trigger */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${automation.is_active ? 'bg-emerald-500/15' : 'bg-white/8'}`}>
        {triggerIcon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white/85 font-semibold text-sm truncate">
            {automation.name}
          </span>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${automation.is_active ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/25' : 'bg-white/8 text-white/40 border-white/10'}`}>
            {automation.is_active ? t('list.active') : t('list.inactive')}
          </span>
        </div>

        {automation.description && (
          <p className="text-white/40 text-xs mb-1 truncate">
            {automation.description}
          </p>
        )}

        <div className="flex gap-3 items-center">
          <span className="text-white/40 text-xs">
            {t('list.lastRun')}: {formatLastRun(automation.last_run_at, t)}
          </span>
          {automation.run_count > 0 && (
            <span className="text-white/40 text-xs">
              {t('list.runs', { count: automation.run_count })}
            </span>
          )}
        </div>
      </div>

      {/* Toggle activo */}
      <div onClick={handleToggle} className="group/toggle flex-shrink-0">
        <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${automation.is_active ? 'bg-emerald-500/40' : 'bg-white/15'}`}>
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm group-hover/toggle:scale-105"
            style={{ left: automation.is_active ? '18px' : '2px' }}
          />
        </div>
      </div>

      {/* Menú contextual */}
      <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => { setMenuOpen(v => !v); setConfirmDelete(false) }}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all border ${menuOpen ? 'bg-white/15 border-white/20 text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-[100] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden min-w-[160px]">
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z\" /></svg>"} label={t('card.edit')}      onClick={() => { setMenuOpen(false); onEdit(automation) }} />
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\" /></svg>"} label={t('card.duplicate')} onClick={handleDuplicate} loading={duplicate.isPending} />
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\" /></svg>"} label={t('card.export')}    onClick={handleExport} />
            <div className="h-px bg-white/10 mx-0" />
            <MenuItem
              icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\" /></svg>"}
              label={confirmDelete ? t('card.confirmDelete') : t('card.delete')}
              onClick={handleDelete}
              danger
              loading={remove.isPending}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger = false, loading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors ${danger ? 'text-red-400 hover:bg-red-500/15' : 'text-white/70 hover:bg-white/10 hover:text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span dangerouslySetInnerHTML={{ __html: icon }} />
      <span>{loading ? '...' : label}</span>
    </button>
  )
}
