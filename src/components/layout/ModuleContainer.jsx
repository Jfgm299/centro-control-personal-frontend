export default function ModuleContainer({ children }) {
  const containerStyle = {
    top: '64px',
    bottom: '0',
  }

  return (
    <div
      className="fixed left-0 right-0 pb-4"
      style={containerStyle}
    >
      <div className="h-full overflow-hidden bg-transparent">
        <div className="h-full overflow-y-auto relative">
          <div className="p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
