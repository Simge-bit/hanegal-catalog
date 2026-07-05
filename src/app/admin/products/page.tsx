'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, getProducts, deleteProduct, upsertProduct, uploadProductImage } from '@/lib/supabase'
import { Product, COLOR_LABELS, ColorVariant, SIZE_OPTIONS } from '@/types/product'
import { useLang } from '@/context/LangContext'
import { Plus, Pencil, Trash2, LogOut, Eye, EyeOff, Upload, X, Check } from 'lucide-react'

export default function AdminProducts() {
  const router = useRouter()
  const { t, lang } = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [searchAdmin, setSearchAdmin] = useState('')
  const [carInput, setCarInput] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/admin/login')
    })
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const [jsonRes, dbProducts] = await Promise.all([
      fetch('/products.json').then(r => r.json()).catch(() => []),
      getProducts({ activeOnly: false }).catch(() => [] as Product[]),
    ])
    type JsonProduct = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'image_url'> & { image_path: string | null }
    const jsonProducts: Product[] = (jsonRes as JsonProduct[])
      .map(({ image_path, ...p }, i) => ({ ...p, image_url: null, id: String(i + 1), created_at: '', updated_at: '' }))
    const dbKeys = new Set(dbProducts.map((p: Product) => p.model_code + '_' + p.size_inch + '_' + p.color_variant))
    const merged = [
      ...dbProducts,
      ...jsonProducts.filter(p => !dbKeys.has(p.model_code + '_' + p.size_inch + '_' + p.color_variant)),
    ]
    setProducts(merged)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function handleSave() {
    if (!editProduct) return
    setSaving(true)
    try {
      let imageUrl = editProduct.image_url
      if (imageFile && editProduct.model_code) {
        imageUrl = await uploadProductImage(imageFile, editProduct.model_code)
      }
      // JSON-fallback products carry a fake non-uuid id and blank timestamps; drop them so Supabase inserts a fresh row
      const { id, created_at, updated_at, ...rest } = editProduct
      const payload = editProduct.created_at ? { ...rest, id, created_at, updated_at } : rest
      await upsertProduct({ ...payload, image_url: imageUrl, base_model: editProduct.base_model || editProduct.model_code })
      setEditProduct(null)
      setImageFile(null)
      setImagePreview(null)
      await loadProducts()
    } catch (e) {
      alert('Kaydetme hatası: ' + (e as Error).message)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    await deleteProduct(id)
    await loadProducts()
  }

  async function handleToggleActive(product: Product) {
    await upsertProduct({ ...product, is_active: !product.is_active })
    await loadProducts()
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const filtered = products.filter(p =>
    !searchAdmin || p.model_code.toLowerCase().includes(searchAdmin.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[#2d2d2d] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#CC0000] font-black text-xl italic">Hanegal</span>
            <span className="text-white/30 text-xs">{t('adminPanel')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-white/50 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors"
            >
              Siteye Git
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={searchAdmin}
            onChange={e => setSearchAdmin(e.target.value)}
            placeholder="Model ara..."
            className="bg-[#2d2d2d] border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-[#CC0000]/50"
          />
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">{products.length} ürün</span>
            <button
              onClick={() => setEditProduct({ is_active: true, color_variant: 'silver', size_inch: 13 })}
              className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('addProduct')}
            </button>
          </div>
        </div>

        {/* Ürün Tablosu */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-[#2d2d2d] rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                  <th className="text-left px-4 py-3 w-16">Görsel</th>
                  <th className="text-left px-4 py-3">Model</th>
                  <th className="text-left px-4 py-3">Boyut</th>
                  <th className="text-left px-4 py-3">Renk</th>
                  <th className="text-left px-4 py-3">Durum</th>
                  <th className="text-right px-4 py-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const imgSrc = product.image_url || `/products/${product.model_code}_${product.size_inch}inc.webp`
                  return (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 bg-[#1a1a1a] rounded-lg overflow-hidden">
                          <Image src={imgSrc} alt={product.model_code} fill className="object-contain p-1" />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{product.model_code}</td>
                      <td className="px-4 py-3 text-white/70">{product.size_inch}"</td>
                      <td className="px-4 py-3 text-white/70">
                        {COLOR_LABELS[product.color_variant]?.[lang] ?? product.color_variant}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors ${
                            product.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/10 text-white/30'
                          }`}
                        >
                          {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {product.is_active ? t('active') : t('passive')}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditProduct(product); setImagePreview(product.image_url || null) }}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#2d2d2d] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">
                {editProduct.id ? t('editProduct') : t('addProduct')}
              </h2>
              <button onClick={() => { setEditProduct(null); setImageFile(null); setImagePreview(null) }}>
                <X className="w-5 h-5 text-white/40 hover:text-white" />
              </button>
            </div>

            {/* Görsel */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-[#1a1a1a] rounded-xl overflow-hidden flex-shrink-0">
                {(imagePreview || editProduct.image_url || editProduct.model_code) && (
                  <Image
                    src={imagePreview || editProduct.image_url || `/products/${editProduct.model_code}_${editProduct.size_inch}inc.webp`}
                    alt="preview"
                    fill
                    className="object-contain p-2"
                  />
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-[#1a1a1a] hover:bg-white/10 text-white/60 text-sm px-3 py-2 rounded-xl border border-white/10 transition-colors">
                <Upload className="w-4 h-4" />
                {t('uploadImage')}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 text-xs mb-1">{t('modelCode')}</label>
                <input
                  value={editProduct.model_code || ''}
                  onChange={e => setEditProduct({ ...editProduct, model_code: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CC0000]/50"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1">{t('size')}</label>
                <select
                  value={editProduct.size_inch || 13}
                  onChange={e => setEditProduct({ ...editProduct, size_inch: Number(e.target.value) })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CC0000]/50"
                >
                  {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}"</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 text-xs mb-1">Fiyat (₺)</label>
                <input
                  type="number"
                  value={editProduct.price || ''}
                  onChange={e => setEditProduct({ ...editProduct, price: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0.00"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CC0000]/50"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setEditProduct({ ...editProduct, in_stock: !editProduct.in_stock })}
                    className={`w-10 h-6 rounded-full transition-colors ${editProduct.in_stock !== false ? 'bg-green-500' : 'bg-red-500/60'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${editProduct.in_stock !== false ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="text-sm text-white/60">{editProduct.in_stock !== false ? 'Stokta Var' : 'Stokta Yok'}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">{t('color')}</label>
              <select
                value={editProduct.color_variant || 'silver'}
                onChange={e => setEditProduct({ ...editProduct, color_variant: e.target.value as ColorVariant })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CC0000]/50"
              >
                {Object.entries(COLOR_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l[lang]}</option>
                ))}
              </select>
            </div>

            {/* Uyumlu Araçlar */}
            <div>
              <label className="block text-white/50 text-xs mb-2">Uyumlu Araçlar</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={carInput}
                  onChange={e => setCarInput(e.target.value)}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && carInput.trim()) {
                      e.preventDefault()
                      const val = carInput.trim()
                      if (!(editProduct.compatible_cars || []).includes(val)) {
                        setEditProduct({ ...editProduct, compatible_cars: [...(editProduct.compatible_cars || []), val] })
                      }
                      setCarInput('')
                    }
                  }}
                  placeholder="ör. Renault Clio, Ford Focus..."
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CC0000]/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = carInput.trim()
                    if (val && !(editProduct.compatible_cars || []).includes(val)) {
                      setEditProduct({ ...editProduct, compatible_cars: [...(editProduct.compatible_cars || []), val] })
                    }
                    setCarInput('')
                  }}
                  className="px-3 py-2 bg-[#CC0000]/20 hover:bg-[#CC0000]/30 text-[#CC0000] rounded-xl text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(editProduct.compatible_cars || []).map(car => (
                  <span key={car} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/30 text-[#CC0000]">
                    {car}
                    <button type="button" onClick={() => setEditProduct({ ...editProduct, compatible_cars: (editProduct.compatible_cars || []).filter(c => c !== car) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditProduct({ ...editProduct, is_active: !editProduct.is_active })}
                className={`w-10 h-6 rounded-full transition-colors ${editProduct.is_active ? 'bg-green-500' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${editProduct.is_active ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-white/60">
                {editProduct.is_active ? t('active') : t('passive')}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setEditProduct(null); setImageFile(null); setImagePreview(null) }}
                className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Check className="w-4 h-4" /> {t('save')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}