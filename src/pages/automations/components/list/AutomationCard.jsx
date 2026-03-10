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
  if (diffMin < 1)   return 'Ahora'
  if (diffMin < 60)  return `Hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)    return `Hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `Hace ${diffD}d`
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
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 14,
        padding: isMobile ? '14px 16px' : '16px 20px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f0f0f0' }}
    >
      {/* Icono trigger */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: automation.is_active ? '#f0fdf4' : '#f9fafb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {triggerIcon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: '#111827',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {automation.name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
            background: automation.is_active ? '#dcfce7' : '#f3f4f6',
            color: automation.is_active ? '#15803d' : '#6b7280',
            flexShrink: 0,
          }}>
            {automation.is_active ? t('list.active') : t('list.inactive')}
          </span>
        </div>

        {automation.description && (
          <p style={{
            fontSize: 12, color: '#6b7280', margin: '0 0 4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {automation.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {t('list.lastRun')}: {formatLastRun(automation.last_run_at, t)}
          </span>
          {automation.run_count > 0 && (
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              {t('list.runs', { count: automation.run_count })}
            </span>
          )}
        </div>
      </div>

      {/* Toggle activo */}
      <div onClick={handleToggle} className="group/toggle" style={{ flexShrink: 0 }}>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: automation.is_active ? '#22c55e' : '#d1d5db',
          position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: automation.is_active ? 18 : 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          className="group-hover/toggle:scale-105" />
        </div>
      </div>

      {/* Menú contextual */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => { setMenuOpen(v => !v); setConfirmDelete(false) }}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${menuOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
          style={{ border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 32, zIndex: 100,
            background: '#fff', borderRadius: 12, padding: '6px 0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid #f0f0f0', minWidth: 160,
          }}>
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z\" /></svg>"} label={t('card.edit')}      onClick={() => { setMenuOpen(false); onEdit(automation) }} />
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\" /></svg>"} label={t('card.duplicate')} onClick={handleDuplicate} loading={duplicate.isPending} />
            <MenuItem icon={"<svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4\" /></svg>"} label={t('card.export')}    onClick={handleExport} />
            <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
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
      className={`flex items-center gap-2 w-full px-3.5 py-2 text-sm font-medium transition-colors ${danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ border: 'none', background: 'none', textAlign: 'left' }}
    >
      <span dangerouslySetInnerHTML={{ __html: icon }} />
      <span>{loading ? '...' : label}</span>
    </button>
  )
}