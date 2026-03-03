import { useState, useEffect } from 'react'

/**
 * Returns true if running as a native Capacitor app OR the screen is mobile-width.
 * Desktop browser → false (original layout)
 * iPhone/Android app → true (mobile layout)
 * Browser < 768px → true (responsive fallback)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Check Capacitor native platform
    try {
      const { Capacitor } = window
      if (Capacitor?.isNativePlatform?.()) return true
    } catch {}
    // Check screen width
    return window.innerWidth < 768
  })

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => {
      try {
        const { Capacitor } = window
        if (Capacitor?.isNativePlatform?.()) { setIsMobile(true); return }
      } catch {}
      setIsMobile(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}