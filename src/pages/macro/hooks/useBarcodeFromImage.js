import { useState, useCallback } from 'react'
import Quagga from '@ericblade/quagga2'

/**
 * useBarcodeFromImage
 * Decodes a barcode from a static image file using QuaggaJS2.
 * Much better than ZXing for photos: adaptive thresholding, Sobel edge detection,
 * works at multiple scales.
 */

function decodeWithQuagga(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)

    Quagga.decodeSingle(
      {
        src: url,
        numOfWorkers: 0, // must be 0 for single-image mode
        inputStream: { size: 1200 }, // upscale for better detection
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
            'code_128_reader',
            'code_39_reader',
          ],
        },
        locate: true, // let Quagga find the barcode within the image
      },
      (result) => {
        URL.revokeObjectURL(url)
        if (result?.codeResult?.code) {
          resolve(result.codeResult.code)
        } else {
          reject(new Error('NO_BARCODE_IN_IMAGE'))
        }
      }
    )
  })
}

export function useBarcodeFromImage() {
  const [isDecoding, setIsDecoding] = useState(false)
  const [error, setError]           = useState(null)

  const decodeImage = useCallback(async (file) => {
    setIsDecoding(true)
    setError(null)
    try {
      const barcode = await decodeWithQuagga(file)
      return barcode
    } catch (err) {
      const code = err.message || 'UNKNOWN_ERROR'
      setError(code)
      throw err
    } finally {
      setIsDecoding(false)
    }
  }, [])

  return { decodeImage, isDecoding, error }
}