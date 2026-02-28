import { useTranslation } from 'react-i18next'

export default function GymPage() {
  const { t } = useTranslation('gym')
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
      <p className="text-gray-400 mt-1">{t('subtitle')}</p>
    </div>
  )
}