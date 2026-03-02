import { useState, useCallback } from 'react'

const SUPPORTED_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('IMAGE_LOAD_FAILED')) }
    img.src = url
  })
}

async function decodeWithNativeAPI(img) {
  const detector = new window.BarcodeDetector({ formats: SUPPORTED_FORMATS })
  const barcodes = await detector.detect(img)
  if (barcodes.length === 0) throw new Error('NO_BARCODE_IN_IMAGE')
  return barcodes[0].rawValue
}

async function decodeWithZxing(img) {
  const { BrowserMultiFormatReader } = await import('@zxing/browser')
  const canvas = document.createElement('canvas')
  canvas.width  = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d').drawImage(img, 0, 0)
  const reader = new BrowserMultiFormatReader()
  try {
    const result = await reader.decodeFromCanvas(canvas)
    return result.getText()
  } catch {
    throw new Error('NO_BARCODE_IN_IMAGE')
  }
}

let _nativeSupportCache = null
async function nativeSupportsEAN13() {
  if (_nativeSupportCache !== null) return _nativeSupportCache
  if (!('BarcodeDetector' in window)) { _nativeSupportCache = false; return false }
  try {
    const formats = await window.BarcodeDetector.getSupportedFormats()
    _nativeSupportCache = formats.includes('ean_13')
  } catch {
    _nativeSupportCache = false
  }
  return _nativeSupportCache
}

export function useBarcodeFromImage() {
  const [isDecoding, setIsDecoding] = useState(false)
  const [error, setError]           = useState(null)

  const decodeImage = useCallback(async (file) => {
    setIsDecoding(true)
    setError(null)

    let url = null
    try {
      const { img, url: objectUrl } = await loadImage(file)
      url = objectUrl

      const useNative = await nativeSupportsEAN13()
      const barcode   = useNative
        ? await decodeWithNativeAPI(img)
        : await decodeWithZxing(img)

      return barcode
    } catch (err) {
      const code = err.message || 'UNKNOWN_ERROR'
      setError(code)
      throw err
    } finally {
      if (url) URL.revokeObjectURL(url)
      setIsDecoding(false)
    }
  }, [])

  return { decodeImage, isDecoding, error }
}