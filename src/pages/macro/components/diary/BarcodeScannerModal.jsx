import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Capacitor } from '@capacitor/core'
import { useTranslation } from 'react-i18next'
import { Camera, CheckCircle2 } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

let BarcodeScanner = null
let BarcodeFormat  = null

async function loadNativeScanner() {
  if (BarcodeScanner) return true
  try {
    const mod = await import('@capacitor-mlkit/barcode-scanning')
    BarcodeScanner = mod.BarcodeScanner
    BarcodeFormat  = mod.BarcodeFormat
    return true
  } catch { return false }
}

const IS_NATIVE = Capacitor.isNativePlatform()

// ─────────────────────────────────────────────────────────────────────────────
// Native ML Kit scanner
// ─────────────────────────────────────────────────────────────────────────────
function NativeScanner({ onDetected, onClose }) {
  const { t } = useTranslation('macro')
  const [error, setError]       = useState(null)
  const [detected, setDetected] = useState(false)
  const [ready, setReady]       = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const start = async () => {
      const loaded = await loadNativeScanner()
      if (!loaded) { setError(t('scanner.errors.nativeLoad')); return }

      try {
        const { camera } = await BarcodeScanner.checkPermissions()
        if (camera === 'denied') { setError(t('scanner.errors.cameraDeniedSettings')); return }
        if (camera !== 'granted') {
          const result = await BarcodeScanner.requestPermissions()
          if (result.camera !== 'granted') { setError(t('scanner.errors.cameraDenied')); return }
        }

        await BarcodeScanner.addListener('barcodeScanned', async ({ barcode }) => {
          setDetected(true)
          // Restaurar UI antes de notificar
          document.getElementById('root').style.opacity = '1'
          await BarcodeScanner.removeAllListeners()
          await BarcodeScanner.stopScan()
          onDetected(barcode.rawValue)
        })

        // Hacer WebView transparente ocultando solo el fondo, no el contenido
        document.getElementById('root').style.opacity = '0'
        document.body.style.background = 'transparent'
        document.documentElement.style.background = 'transparent'

        setReady(true)

        await BarcodeScanner.startScan({
          formats: [
            BarcodeFormat.Ean13, BarcodeFormat.Ean8,
            BarcodeFormat.UpcA,  BarcodeFormat.UpcE,
            BarcodeFormat.Code128, BarcodeFormat.Code39,
            BarcodeFormat.QrCode,
          ],
        })
      } catch (e) {
        document.getElementById('root').style.opacity = '1'
        setError(`${t('scanner.errors.genericPrefix')}: ${e?.message || e?.code || JSON.stringify(e)}`)
      }
    }

    start()

    return () => {
      document.getElementById('root').style.opacity = '1'
      document.body.style.background = ''
      document.documentElement.style.background = ''
      BarcodeScanner?.removeAllListeners?.()
      BarcodeScanner?.stopScan?.()
    }
  }, [onDetected])

  const handleClose = async () => {
    document.getElementById('root').style.opacity = '1'
    document.body.style.background = ''
    document.documentElement.style.background = ''
    await BarcodeScanner?.removeAllListeners?.()
    await BarcodeScanner?.stopScan?.()
    onClose()
  }

  // Portal directo a body — visible aunque #root esté en opacity:0
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', flexDirection: 'column',
      background: 'transparent', touchAction: 'none',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!error && ready && (
          <div style={{ position: 'relative', width: 288, height: 176 }}>
            {[
              { top: 0,    left:  0, borderTop:    '3px solid', borderLeft:   '3px solid', borderRadius: '12px 0 0 0'  },
              { top: 0,    right: 0, borderTop:    '3px solid', borderRight:  '3px solid', borderRadius: '0 12px 0 0'  },
              { bottom: 0, left:  0, borderBottom: '3px solid', borderLeft:   '3px solid', borderRadius: '0 0 0 12px'  },
              { bottom: 0, right: 0, borderBottom: '3px solid', borderRight:  '3px solid', borderRadius: '0 0 12px 0'  },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 32, height: 32, borderColor: detected ? '#22c55e' : '#f59e0b', ...s }} />
            ))}
            {!detected && (
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2, top: '50%',
                background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                opacity: 0.9, animation: 'scanline 1.8s ease-in-out infinite',
              }} />
            )}
            {detected && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={48} color="#22c55e" strokeWidth={2.25} />
              </div>
            )}
          </div>
        )}
        {error && (
          <div style={{ margin: '0 32px', background: 'rgba(0,0,0,0.85)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Camera size={40} color="white" strokeWidth={2.25} /></div>
            <p style={{ color: 'white', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.75)', padding: '20px 24px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, flex: 1 }}>
          {detected ? t('scanner.detected') : t('scanner.pointToBarcode')}
        </p>
        <button onClick={handleClose} style={{
          marginLeft: 16, padding: '8px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 14,
          border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
        }}>
          {t('common.cancel')}
        </button>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 88%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Web ZXing scanner
// ─────────────────────────────────────────────────────────────────────────────
function WebScanner({ onDetected, onClose }) {
  const { t } = useTranslation('macro')
  const videoRef = useRef(null)
  const [error, setError]       = useState(null)
  const [detected, setDetected] = useState(false)
  const [hint, setHint]         = useState(t('scanner.pointToBarcode'))

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls = null
    const start = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const rear = devices.find(d => /back|rear|environment/i.test(d.label)) ?? devices[devices.length - 1]
        controls = await reader.decodeFromVideoDevice(
          rear?.deviceId ?? undefined, videoRef.current,
          (result, err) => {
            if (result) { setDetected(true); setHint(t('scanner.detected')); controls?.stop?.(); onDetected(result.getText()) }
            if (err && !(err instanceof NotFoundException)) console.warn('ZXing:', err)
          }
        )
      } catch (e) { setError(`${t('scanner.errors.cameraAccess')}: ${e?.message || e}`) }
    }
    start()
    return () => { controls?.stop?.() }
  }, [onDetected, t])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" style={{ touchAction: 'none' }}>
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 65% 35% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)' }} />
            <div className="relative w-64 h-40">
              {['top-0 left-0 border-t-2 border-l-2 rounded-tl-lg','top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg','bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
              ].map((cls, i) => <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: detected ? '#22c55e' : '#f59e0b' }} />)}
              {!detected && <div className="absolute left-0 right-0 h-0.5 opacity-80" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)', animation: 'scanline 1.8s ease-in-out infinite', top: '50%' }} />}
              {detected && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 size={40} color="#22c55e" strokeWidth={2.25} /></div>}
            </div>
          </div>
        )}
        {error && <div className="absolute inset-0 flex items-center justify-center p-8"><div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center"><div className="mb-3 flex justify-center"><Camera size={40} color="white" strokeWidth={2.25} /></div><p className="text-white text-sm">{error}</p></div></div>}
      </div>
      <div className="bg-black/80 backdrop-blur px-6 py-5 flex items-center justify-between" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
        <p className="text-white/70 text-sm flex-1">{hint}</p>
        <button onClick={onClose} className="ml-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium border border-white/20">{t('common.cancel')}</button>
      </div>
      <style>{`@keyframes scanline { 0% { top: 10%; } 50% { top: 88%; } 100% { top: 10%; } }`}</style>
    </div>
  )
}

export default function BarcodeScannerModal({ onDetected, onClose }) {
  if (IS_NATIVE) return <NativeScanner onDetected={onDetected} onClose={onClose} />
  return <WebScanner onDetected={onDetected} onClose={onClose} />
}
