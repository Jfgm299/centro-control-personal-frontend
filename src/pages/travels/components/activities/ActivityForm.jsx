import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateActivity, useUpdateActivity } from '../../hooks/useActivities'
import { ACTIVITY_CATEGORIES, RATING_STARS } from '../../constants'

const FIELD = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-900'

export default function ActivityForm({ tripId, activity = null, onClose }) {
  const { t } = useTranslation('travels')
  const isEdit = !!activity

  const [form, setForm] = useState({
    title:       activity?.title       ?? '',
    category:    activity?.category    ?? '',
    description: activity?.description ?? '',
    date:        activity?.date        ?? '',
    rating:      activity?.rating      ?? null,
  })
  const [error, setError] = useState(null)

  const createActivity = useCreateActivity(tripId)
  const updateActivity = useUpdateActivity(tripId)
  const isPending      = createActivity.isPending || updateActivity.isPending

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.title.trim()) return setError(t('form.errorTitle'))

    const payload = {
      title:       form.title.trim(),
      category:    form.category || undefined,
      description: form.description.trim() || undefined,
      date:        form.date || undefined,
      rating:      form.rating || undefined,
    }

    try {
      if (isEdit) await updateActivity.mutateAsync({ activityId: activity.id, ...payload })
      else        await createActivity.mutateAsync(payload)
      onClose()
    } catch {
      setError(t('form.errorGeneric'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t('activities.editTitle') : t('activities.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('activities.title')} *</label>
            <input className={FIELD} value={form.title} onChange={set('title')}
                   placeholder={t('activities.titlePlaceholder')} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">{t('activities.category')}</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setForm(f => ({ ...f, category: f.category === cat.value ? '' : cat.value }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.category === cat.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-slate-400'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('activities.date')}</label>
              <input className={FIELD} type="date" value={form.date} onChange={set('date')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{t('activities.rating')}</label>
              <div className="flex gap-1 mt-1.5">
                {RATING_STARS.map(star => (
                  <button
                    key={star}
                    onClick={() => setForm(f => ({ ...f, rating: f.rating === star ? null : star }))}
                    className="text-xl"
                  >
                    {star <= (form.rating ?? 0) ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('activities.description')}</label>
            <textarea className={`${FIELD} resize-none`} rows={2}
                      value={form.description} onChange={set('description')}
                      placeholder={t('activities.descriptionPlaceholder')} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700">
            {t('form.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50">
            {isPending ? t('form.saving') : isEdit ? t('form.save') : t('form.create')}
          </button>
        </div>
      </div>
    </div>
  )
}