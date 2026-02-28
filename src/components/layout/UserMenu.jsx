import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation('common')
  const menuRef = useRef(null)

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'CC'
  const currentLang = i18n.language

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('language', code)
  }

  // Cerrar al clicar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="fixed top-4 right-6 z-50">
      {/* Avatar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}
          >
            {initials}
          </div>
        )}
      </button>

      {/* Panel flotante */}
      {open && (
        <div
          className="absolute right-0 top-12 w-64 rounded-2xl shadow-xl border border-white/60 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header usuario */}
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          {/* Idioma */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {t('settings.language')}
            </p>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                    currentLang === lang.code
                      ? 'bg-indigo-500 text-white font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opciones futuras */}
          <div className="px-4 py-3">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
              <span>→</span>
              <span>{t('settings.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}