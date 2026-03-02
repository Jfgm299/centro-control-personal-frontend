import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateAlbum, useUpdateAlbum } from '../../hooks/useAlbums'

const FIELD = 'border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-900'

export default function AlbumForm({ tripId, album = null, onClose }) {
  const { t } = useTranslation('travels')
  const isEdit = !!album

  const [form, setForm] = useState({
    name:        album?.name        ?? '',
    description: album?.description ?? '',
  })
  const [error, setError] = useState(null)

  const createAlbum = useCreateAlbum(tripId)
  const updateAlbum = useUpdateAlbum(tripId, album?.id)
  const isPending   = createAlbum.isPending || updateAlbum.isPending

  const handleSubmit = async () => {
    setError(null)
    if (!form.name.trim()) return setError(t('form.errorTitle'))

    try {
      if (isEdit) await updateAlbum.mutateAsync({ name: form.name.trim(), description: form.description.trim() || undefined })
      else        await createAlbum.mutateAsync({ name: form.name.trim(), description: form.description.trim() || undefined })
      onClose()
    } catch {
      setError(t('form.errorGeneric'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? t('albums.editTitle') : t('albums.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('albums.name')} *</label>
            <input className={FIELD} value={form.name}
                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                   placeholder={t('albums.namePlaceholder')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('albums.description')}</label>
            <textarea className={`${FIELD} resize-none`} rows={2}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder={t('albums.descriptionPlaceholder')} />
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