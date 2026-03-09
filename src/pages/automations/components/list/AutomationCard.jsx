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
      <div onClick={handleToggle} style={{ flexShrink: 0 }}>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: automation.is_active ? '#22c55e' : '#d1d5db',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: automation.is_active ? 18 : 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      {/* Menú contextual */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => { setMenuOpen(v => !v); setConfirmDelete(false) }}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: menuOpen ? '#f3f4f6' : 'transparent',
            cursor: 'pointer', fontSize: 16, color: '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ···
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 32, zIndex: 100,
            background: '#fff', borderRadius: 12, padding: '6px 0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid #f0f0f0', minWidth: 160,
          }}>
            <MenuItem icon="✏️" label={t('card.edit')}      onClick={() => { setMenuOpen(false); onEdit(automation) }} />
            <MenuItem icon="📋" label={t('card.duplicate')} onClick={handleDuplicate} loading={duplicate.isPending} />
            <MenuItem icon="⬇️" label={t('card.export')}    onClick={handleExport} />
            <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
            <MenuItem
              icon="🗑️"
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
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 14px',
        border: 'none', background: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: 13, fontWeight: 500,
        color: danger ? '#ef4444' : '#374151',
        textAlign: 'left',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? '#fef2f2' : '#f9fafb' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >
      <span>{icon}</span>
      <span>{loading ? '...' : label}</span>
    </button>
  )
}