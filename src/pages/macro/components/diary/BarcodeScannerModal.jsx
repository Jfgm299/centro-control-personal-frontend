import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

/**
 * BarcodeScannerModal
 * Opens the rear camera and scans frame-by-frame.
 * Calls onDetected(barcode) as soon as a code is found, then auto-closes.
 * Calls onClose() if the user dismisses manually.
 */
export default function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef   = useRef(null)
  const readerRef  = useRef(null)
  const [error, setError]     = useState(null)
  const [hint, setHint]       = useState('Apunta al código de barras')
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    let controls = null

    const start = async () => {
      try {
        // Prefer rear camera on mobile
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const rear = devices.find(d =>
          /back|rear|environment/i.test(d.label)
        ) ?? devices[devices.length - 1]

        const deviceId = rear?.deviceId ?? undefined

        controls = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              setDetected(true)
              setHint('¡Código detectado!')
              controls?.stop?.()
              onDetected(result.getText())
            }
            // NotFoundException is normal — fires every frame with no barcode
            if (err && !(err instanceof NotFoundException)) {
              console.warn('ZXing error:', err)
            }
          }
        )
      } catch (e) {
        setError('No se pudo acceder a la cámara. Usa la opción de imagen.')
      }
    }

    start()

    return () => {
      controls?.stop?.()
    }
  }, [onDetected])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      style={{ touchAction: 'none' }}
    >
      {/* Camera feed */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scanning overlay */}
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dark vignette */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 65% 35% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)'
            }} />

            {/* Viewfinder box */}
            <div className="relative w-64 h-40">
              {/* Corners */}
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-6 h-6 ${cls}`}
                  style={{ borderColor: detected ? '#22c55e' : '#f59e0b' }}
                />
              ))}

              {/* Scan line animation */}
              {!detected && (
                <div
                  className="absolute left-0 right-0 h-0.5 opacity-80"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                    animation: 'scanline 1.8s ease-in-out infinite',
                    top: '50%',
                  }}
                />
              )}

              {detected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">📷</div>
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-black/80 backdrop-blur px-6 py-5 flex items-center justify-between"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
      >
        <p className="text-white/70 text-sm flex-1">{hint}</p>
        <button
          onClick={onClose}
          className="ml-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/20"
        >
          Cancelar
        </button>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 88%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}