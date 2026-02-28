export default function ModuleContainer({ children }) {
  return (
    <div
      className="fixed left-0 right-0 bottom-0 px-4 pb-4"
      style={{ top: '52px' }}
    >
      <div
        className="h-full rounded-b-2xl rounded-tr-2xl shadow-sm border border-white/80 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="h-full overflow-y-auto relative">
          {/* Sticky top strip to keep connection with tabs */}
          <div 
            className="sticky top-0 left-0 right-0 h-1.5 z-50 w-full"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
            }}
          />
          <div style={{ padding: '2rem 2rem 6rem 2rem' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}