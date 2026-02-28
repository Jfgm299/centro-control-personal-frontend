export default function DotBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f0f0f5' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #c8c8d8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  )
}