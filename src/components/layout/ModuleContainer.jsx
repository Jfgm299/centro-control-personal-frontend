import { Capacitor } from '@capacitor/core'

const IS_MOBILE = Capacitor.isNativePlatform() || window.innerWidth < 768

export default function ModuleContainer({ children }) {
  return (
    <div
      className="fixed left-0 right-0 px-4 pb-4"
      style={{
        top: '52px',
        bottom: IS_MOBILE
          ? 'calc(env(safe-area-inset-bottom) + 80px)'
          : '0',
      }}
    >
      <div
        className="h-full rounded-b-2xl rounded-tr-2xl shadow-sm border border-white/80 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="h-full overflow-y-auto relative">
          <div
            className="sticky top-0 left-0 right-0 h-1.5 z-50 w-full"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
            }}
          />
          <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}