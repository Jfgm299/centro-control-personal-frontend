import { useRef, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useBarcodeFromImage } from '../../hooks/useBarcodeFromImage'
import { useAddDiaryEntry } from '../../hooks/useDiaryMutations'
import { NUTRISCORE_COLORS } from '../../constants'
import BarcodeScannerModal from './BarcodeScannerModal'

const STEP = {
  UPLOAD:  'upload',
  LOADING: 'loading',
  CONFIRM: 'confirm',
  SEARCH:  'search',
  CREATE:  'create',
}

const ERROR_MESSAGES = {
  NO_BARCODE_IN_IMAGE: 'add.error.noBarcode',
  IMAGE_LOAD_FAILED:   'add.error.imageLoad',
  UNKNOWN_ERROR:       'add.error.unknown',
}

const NUTRIENT_FIELDS = [
  { key: 'energy_kcal_100g',   label: 'kcal',  color: '#f59e0b', unit: 'kcal' },
  { key: 'proteins_100g',      label: 'Prot',  color: '#3b82f6', unit: 'g'    },
  { key: 'carbohydrates_100g', label: 'Carbs', color: '#10b981', unit: 'g'    },
  { key: 'fat_100g',           label: 'Grasa', color: '#f43f5e', unit: 'g'    },
  { key: 'fiber_100g',         label: 'Fibra', color: '#8b5cf6', unit: 'g'    },
  { key: 'salt_100g',          label: 'Sal',   color: '#6b7280', unit: 'g'    },
]

async function hasCamera() {
  if (!navigator.mediaDevices?.enumerateDevices) return false
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((d) => d.kind === 'videoinput')
  } catch { return false }
}

const emptyCreate = () => ({
  product_name: '', brand: '',
  energy_kcal_100g: '', proteins_100g: '', carbohydrates_100g: '',
  sugars_100g: '', fat_100g: '', saturated_fat_100g: '',
  fiber_100g: '', salt_100g: '', serving_quantity_g: '',
})

export default function AddProductFlow({ mealType, date, onClose }) {
  const { t } = useTranslation('macro')
  const fileRef = useRef(null)

  const { decodeImage } = useBarcodeFromImage()
  const addEntry = useAddDiaryEntry(date)

  const [step, setStep]           = useState(STEP.UPLOAD)
  const [product, setProduct]     = useState(null)
  const [amountG, setAmountG]     = useState('')
  const [selectedMeal]            = useState(mealType)
  const [error, setError]         = useState(null)
  const [searchQ, setSearchQ]     = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  // Edit mode in confirm step
  const [editing, setEditing]     = useState(false)
  const [editVals, setEditVals]   = useState({})
  const [saving, setSaving]       = useState(false)

  // Create form
  const [createForm, setCreateForm] = useState(emptyCreate())
  const [creating, setCreating]     = useState(false)

  const debounceRef = useRef(null)

  // ── Autocomplete ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== STEP.SEARCH) return
    const q = searchQ.trim()
    if (q.length < 2) { setSearchResults([]); setSearching(false); clearTimeout(debounceRef.current); return }
    setSearching(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/v1/macros/products/search', { params: { q, limit: 8 } })
        setSearchResults(data)
      } catch { /* silent */ }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQ, step])

  // ── Camera ──────────────────────────────────────────────────────────────────
  const handleScanPress = async () => {
    if (await hasCamera()) setShowCamera(true)
    else fileRef.current?.click()
  }

  const handleCameraDetected = useCallback(async (barcode) => {
    setShowCamera(false)
    await fetchProductByBarcode(barcode)
  }, []) // eslint-disable-line

  // ── Static image ────────────────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setError(null); setStep(STEP.LOADING)
    try {
      const barcode = await decodeImage(file)
      await fetchProductByBarcode(barcode)
    } catch (err) {
      setError(t(ERROR_MESSAGES[err.message] ?? 'add.error.unknown'))
      setStep(STEP.UPLOAD)
    }
  }

  // ── Barcode fetch ───────────────────────────────────────────────────────────
  async function fetchProductByBarcode(barcode) {
    setStep(STEP.LOADING)
    try {
      const { data } = await api.get(`/api/v1/macros/products/barcode/${encodeURIComponent(barcode)}`)
      openConfirm(data)
    } catch (err) {
      if (err.response?.status === 404) { setError(t('add.error.productNotFound')); setStep(STEP.SEARCH) }
      else { setError(t('add.error.unknown')); setStep(STEP.UPLOAD) }
    }
  }

  function openConfirm(p) {
    setProduct(p)
    setAmountG(p.serving_quantity_g ? String(p.serving_quantity_g) : '100')
    setEditing(false)
    setEditVals({})
    setStep(STEP.CONFIRM)
  }

  // ── Edit nutrients ──────────────────────────────────────────────────────────
  function startEdit() {
    const vals = {}
    NUTRIENT_FIELDS.forEach(({ key }) => { vals[key] = product[key] != null ? String(product[key]) : '' })
    setEditVals(vals)
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const payload = {}
      NUTRIENT_FIELDS.forEach(({ key }) => {
        const v = parseFloat(editVals[key])
        if (!isNaN(v)) payload[key] = v
      })
      const { data } = await api.patch(`/api/v1/macros/products/${product.id}`, payload)
      setProduct(data)
      setEditing(false)
    } catch { setError(t('add.error.unknown')) }
    finally { setSaving(false) }
  }

  // ── Search select ───────────────────────────────────────────────────────────
  function selectProduct(p) { openConfirm(p); setSearchResults([]) }

  // ── Manual create ───────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!createForm.product_name.trim()) return
    setCreating(true); setError(null)
    try {
      const payload = { product_name: createForm.product_name.trim() }
      if (createForm.brand.trim()) payload.brand = createForm.brand.trim()
      const numFields = [
        'energy_kcal_100g','proteins_100g','carbohydrates_100g',
        'sugars_100g','fat_100g','saturated_fat_100g','fiber_100g',
        'salt_100g','serving_quantity_g',
      ]
      numFields.forEach((k) => { const v = parseFloat(createForm[k]); if (!isNaN(v)) payload[k] = v })
      const { data } = await api.post('/api/v1/macros/products', payload)
      openConfirm(data)
    } catch { setError(t('add.error.unknown')) }
    finally { setCreating(false) }
  }

  // ── Confirm ─────────────────────────────────────────────────────────────────
  async function handleConfirm() {
    const amount = parseFloat(amountG)
    if (!product || isNaN(amount) || amount <= 0) return
    try {
      await addEntry.mutateAsync({ product_id: product.id, entry_date: date, meal_type: selectedMeal, amount_g: amount })
      onClose()
    } catch { setError(t('add.error.unknown')) }
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }
  const fmt    = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d))
  const nsColor = product?.nutriscore ? NUTRISCORE_COLORS[product.nutriscore.toLowerCase()] ?? '#9ca3af' : '#9ca3af'
  const hasNulls = product && NUTRIENT_FIELDS.some(({ key }) => product[key] == null)

  return (
    <>
      {showCamera && <BarcodeScannerModal onDetected={handleCameraDetected} onClose={() => setShowCamera(false)} />}

      <div className="bg-white/5 rounded-xl p-4 mt-2 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm font-medium">{t('add.title')}</span>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none">×</button>
        </div>
        
{error && (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-xs">{error}</div>
)}

        {/* ── STEP: UPLOAD ── */}
        {(step === STEP.UPLOAD || step === STEP.LOADING) && (
          <div className="space-y-3">
            <button onClick={handleScanPress} disabled={step === STEP.LOADING}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 disabled:opacity-50 transition-colors">
              {step === STEP.LOADING
                ? <><span className="animate-spin text-lg">⟳</span>{t('add.decoding')}</>
                : <><span className="text-xl">📷</span>Escanear código de barras</>}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" /><span className="text-white/40 text-xs">o</span><div className="flex-1 h-px bg-white/10" />
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40'} ${step === STEP.LOADING ? 'opacity-60 pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              <p className="text-white/60 text-xs">Sube una foto del código de barras</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep(STEP.SEARCH); setError(null) }}
                className="flex-1 text-center text-white/60 hover:text-white text-xs py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors">
                🔍 Buscar por nombre
              </button>
              <button onClick={() => { setStep(STEP.CREATE); setError(null); setCreateForm(emptyCreate()) }}
                className="flex-1 text-center text-white/60 hover:text-white text-xs py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors">
                ✏️ Crear producto
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: SEARCH ── */}
        {step === STEP.SEARCH && (
          <div className="space-y-3">
            <div className="relative">
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Buscar producto..."
                autoFocus
                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8 transition-colors" />
              {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm animate-spin">⟳</span>}
            </div>

            {searchResults.length > 0 && (
              <div className="bg-black/20 border border-white/20 rounded-xl overflow-hidden shadow-sm divide-y divide-white/10">
                {searchResults.map((p) => (
                  <button key={p.id} onClick={() => selectProduct(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 text-left transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                      {p.image_url ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-white/40">🍽</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.product_name}</p>
                      {p.brand && <p className="text-white/50 text-xs truncate">{p.brand}</p>}
                      {p.source === 'manual' && <span className="text-xs text-indigo-400">• manual</span>}
                    </div>
                    {p.energy_kcal_100g != null && (
                      <span className="text-amber-400 text-xs font-semibold flex-shrink-0">{Math.round(p.energy_kcal_100g)} kcal</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searching && searchQ.trim().length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-white/50 text-xs py-2">Sin resultados — <button className="text-blue-400 underline" onClick={() => { setStep(STEP.CREATE); setCreateForm({ ...emptyCreate(), product_name: searchQ }) }}>crear manualmente</button></p>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep(STEP.UPLOAD); setError(null); setSearchQ(''); setSearchResults([]) }}
                className="text-white/50 hover:text-white text-xs">← Volver</button>
              <button onClick={() => { setStep(STEP.CREATE); setCreateForm({ ...emptyCreate(), product_name: searchQ }) }}
                className="text-blue-400 hover:text-blue-500 text-xs ml-auto">✏️ Crear nuevo</button>
            </div>
          </div>
        )}

        {/* ── STEP: CREATE ── */}
        {step === STEP.CREATE && (
          <div className="space-y-3">
            <p className="text-white/60 text-xs font-medium">Nuevo producto</p>

            {/* Name + brand */}
            <input type="text" placeholder="Nombre del producto *" value={createForm.product_name}
              onChange={(e) => setCreateForm(f => ({ ...f, product_name: e.target.value }))}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            <input type="text" placeholder="Marca (opcional)" value={createForm.brand}
              onChange={(e) => setCreateForm(f => ({ ...f, brand: e.target.value }))}
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />

            {/* Nutrients grid */}
            <p className="text-white/40 text-xs">Valores nutricionales por 100g</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'energy_kcal_100g',   label: 'Calorías (kcal)' },
                { key: 'proteins_100g',      label: 'Proteínas (g)'   },
                { key: 'carbohydrates_100g', label: 'Carbohidratos (g)' },
                { key: 'fat_100g',           label: 'Grasas (g)'      },
                { key: 'fiber_100g',         label: 'Fibra (g)'       },
                { key: 'salt_100g',          label: 'Sal (g)'         },
                { key: 'serving_quantity_g', label: 'Ración típica (g)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p className="text-white/40 text-xs mb-1">{label}</p>
                  <input type="number" min="0" step="0.1" placeholder="—"
                    value={createForm[key]}
                    onChange={(e) => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => { setStep(STEP.UPLOAD); setError(null) }}
                className="flex-1 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating || !createForm.product_name.trim()}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {creating ? '…' : 'Crear y añadir'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRM ── */}
        {step === STEP.CONFIRM && product && (
          <div className="space-y-4">
            {/* Product card */}
            <div className="flex gap-3 bg-black/20 border border-white/20 rounded-xl p-3">
              {product.image_url && (
                <img src={product.image_url} alt={product.product_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p className="text-white text-sm font-semibold flex-1 leading-tight">{product.product_name}</p>
                  {product.nutriscore && (
                    <span className="text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: nsColor, fontSize: '0.6rem' }}>{product.nutriscore}</span>
                  )}
                </div>
                {product.brand && <p className="text-white/60 text-xs mt-0.5">{product.brand}</p>}
                {product.source === 'manual' && <p className="text-indigo-400 text-xs">producto manual</p>}

                {/* Nutrient display / edit */}
                {editing ? (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
                      <div key={key}>
                        <p className="text-white/50 text-xs">{label}</p>
                        <div className="flex items-center gap-0.5">
                          <input type="number" min="0" step="0.1" value={editVals[key]}
                            onChange={(e) => setEditVals(v => ({ ...v, [key]: e.target.value }))}
                            className="w-full bg-black/20 border border-white/20 rounded px-1.5 py-0.5 text-white text-xs outline-none focus:border-blue-500" />
                          <span className="text-white/40 text-xs">{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {NUTRIENT_FIELDS.slice(0, 4).map(({ key, label, color }) => (
                      <div key={key} className="text-center">
                        <p className="text-xs font-semibold" style={{ color }}>{fmt(product[key], key === 'energy_kcal_100g' ? 0 : 1)}</p>
                        <p className="text-white/50 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-white/30 text-xs mt-1">por 100g</p>
              </div>
            </div>

            {/* Edit / save nutrients banner */}
            {!editing && hasNulls && (
              <button onClick={startEdit}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors hover:bg-amber-500/30">
                ⚠️ Algunos valores faltan — toca para editar
              </button>
            )}
            {editing && (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-1.5 rounded-lg border border-white/20 text-white/60 text-xs hover:bg-white/10 transition-colors">Cancelar</button>
                <button onClick={saveEdit} disabled={saving}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                  {saving ? '…' : 'Guardar valores'}
                </button>
              </div>
            )}

            {/* Amount input */}
            <div className="flex items-center gap-3">
              <label className="text-white/60 text-sm flex-shrink-0">Cantidad</label>
              <input type="number" min="1" max="5000" step="1" value={amountG}
                onChange={(e) => setAmountG(e.target.value)}
                className="w-24 bg-black/20 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
              <span className="text-white/50 text-sm">g</span>
              {product.energy_kcal_100g != null && parseFloat(amountG) > 0 && (
                <span className="text-amber-400 text-sm font-semibold ml-auto">
                  ≈ {Math.round(product.energy_kcal_100g * parseFloat(amountG) / 100)} kcal
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setStep(STEP.UPLOAD); setProduct(null); setError(null) }}
                className="flex-1 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirm} disabled={addEntry.isPending || !amountG || parseFloat(amountG) <= 0}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {addEntry.isPending ? 'Guardando…' : 'Añadir al diario'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}