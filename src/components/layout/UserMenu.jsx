import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()   // ← useAuth, no useAuthStore
  const { t, i18n } = useTranslation('common')
  const menuRef = useRef(null)

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'CC'
  const currentLang = i18n.language

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('language', code)
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    window.location.reload()
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div
      ref={menuRef}
      className="fixed right-4 z-50"
      style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      {/* Avatar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
            {initials}
          </div>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-64 rounded-2xl shadow-xl border border-white/20 overflow-hidden backdrop-blur-xl bg-white/10"
        >
          {/* Usuario */}
          <div className="px-4 py-4 border-b border-white/10">
            <p className="font-semibold text-white">{user?.username}</p>
            <p className="text-xs text-white/60">{user?.email}</p>
          </div>

          {/* Idioma */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
              {t('settings.language')}
            </p>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                    currentLang === lang.code
                      ? 'bg-white/20 text-white font-medium border border-white/30'
                      : 'bg-black/20 text-white/70 hover:bg-black/40 border border-transparent'
                  )}>
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="px-4 py-3">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors">
              <span>→</span>
              <span>{t('settings.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}