import { useTranslation }   from 'react-i18next'
import { useCategories }    from '../../hooks/useCategories'
import { useCalendarStore } from '../../store/calendarStore'

export default function CategoryFilter() {
  const { t } = useTranslation('calendar')
  const { data: categories = [] }                       = useCategories()
  const { hiddenCategoryIds, toggleCategoryVisibility } = useCalendarStore()

  if (categories.length === 0) return null

  return (
    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: '.07em', textTransform: 'uppercase', padding: '6px 12px 4px' }}>
        {t('categories.filter.title')}
      </div>
      {categories.map(cat => {
        const visible = !hiddenCategoryIds.has(cat.id)
        return (
          <div
            key={cat.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 6, margin: '0 4px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color ?? '#9ca3af', flexShrink: 0, opacity: visible ? 1 : 0.35 }} />
            <span style={{ flex: 1, fontSize: 12.5, color: visible ? '#374151' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
            </span>
            <button
              onClick={() => toggleCategoryVisibility(cat.id)}
              title={visible ? t('categories.filter.hide') : t('categories.filter.show')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, borderRadius: 4, fontSize: 13, lineHeight: 1, color: visible ? '#6b7280' : '#d1d5db' }}
            >
              {visible ? (<svg style={{ width: 13, height: 13, display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>) : (<svg style={{ width: 13, height: 13, display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>)}
            </button>
          </div>
        )
      })}
    </div>
  )
}