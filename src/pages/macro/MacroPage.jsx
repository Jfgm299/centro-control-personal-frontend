import { useTranslation } from 'react-i18next'

export default function MacroPage() {
  const { t } = useTranslation('macro')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      <p className="text-white/50 mt-1">{t('subtitle')}</p>
    </div>
  )
}