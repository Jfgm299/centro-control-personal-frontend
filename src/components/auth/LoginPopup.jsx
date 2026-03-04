import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/auth'

const MODE = { LOGIN: 'login', REGISTER: 'register' }

export default function LoginPopup() {
  const { t } = useTranslation('auth')
  const { login } = useAuth()

  const [isOpen, setIsOpen]     = useState(false)
  const [mode, setMode]         = useState(MODE.LOGIN)
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState(null)

  const reset = () => { setEmail(''); setUsername(''); setPassword(''); setError(null) }
  const switchMode = (m) => { setMode(m); reset() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (mode === MODE.REGISTER) {
        await authService.register({ email, username, password })
      }
      await login({ email, password })
    } catch (err) {
      setError(err.response?.data?.detail ?? (mode === MODE.LOGIN ? t('loginError') : t('registerError')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed right-4 z-50" style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:bg-slate-700 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {t('loginButton')}
        </button>
      )}

      {isOpen && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {mode === MODE.LOGIN ? t('loginTitle') : t('registerTitle')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === MODE.LOGIN ? t('loginSubtitle') : t('registerSubtitle')}
              </p>
            </div>
            <button onClick={() => { setIsOpen(false); reset() }} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
            {mode === MODE.REGISTER && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">{t('username')}</label>
                <input type="text" required value={username}
                  onChange={(e) => setUsername(e.target.value)} placeholder="johndoe"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">{t('email')}</label>
              <input type="email" required autoFocus value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">{t('password')}</label>
              <input type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={isLoading}
              className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all mt-1">
              {isLoading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {mode === MODE.LOGIN ? t('loggingIn') : t('registering')}
                  </span>
                : mode === MODE.LOGIN ? t('loginSubmit') : t('registerSubmit')}
            </button>

            <p className="text-center text-xs text-slate-400">
              {mode === MODE.LOGIN ? (
                <>{t('noAccount')}{' '}
                  <button type="button" onClick={() => switchMode(MODE.REGISTER)}
                    className="text-slate-700 font-medium hover:underline">{t('registerLink')}</button>
                </>
              ) : (
                <>{t('hasAccount')}{' '}
                  <button type="button" onClick={() => switchMode(MODE.LOGIN)}
                    className="text-slate-700 font-medium hover:underline">{t('loginLink')}</button>
                </>
              )}
            </p>
          </form>
        </div>
      )}
    </div>
  )
}