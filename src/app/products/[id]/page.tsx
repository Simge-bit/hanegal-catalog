'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Product, COLOR_LABELS } from '@/types/product'
import { useLang } from '@/context/LangContext'
import { ArrowLeft, MessageCircle, ZoomIn, X } from 'lucide-react'
import { buildWhatsAppMessage, VEHICLES } from '@/lib/vehicles'

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { lang, t } = useLang()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    const loadJson = () =>
      fetch('/products.json')
        .then(r => r.json())
        .then((data: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) =>
          data.map((p, i) => ({ ...p, id: String(i + 1), created_at: '', updated_at: '' }))
        )
    Promise.all([
      loadJson(),
      import('@/lib/supabase').then(({ getProducts }) => getProducts({ activeOnly: false })).catch(() => [] as Product[]),
    ]).then(([jsonProducts, dbProducts]) => {
      const dbIds = new Set(dbProducts.map(p => p.model_code + '_' + p.size_inch + '_' + p.color_variant))
      const all = [
        ...dbProducts,
        ...jsonProducts.filter(p => !dbIds.has(p.model_code + '_' + p.size_inch + '_' + p.color_variant)),
      ]
      const found = all.find(p => p.id === id)
      setProduct(found || null)
      if (found) setRelated(all.filter(p => p.base_model === found.base_model && p.id !== found.id))
    })
  }, [id])

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const imgSrc = product.image_url || `/products/${product.model_code}_${product.size_inch}inc.webp`
  const colorLabel = COLOR_LABELS[product.color_variant]?.[lang] ?? product.color_variant
  const whatsappMsg = encodeURIComponent(
    buildWhatsAppMessage(product.model_code, product.size_inch, colorLabel, lang)
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('products')}
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Görsel */}
          <div
            className="relative bg-white rounded-2xl overflow-hidden aspect-square cursor-zoom-in group"
            onClick={() => setZoomed(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${imgSrc}?v=3`}
              alt={`${product.model_code} ${product.size_inch}" Jant Kapağı`}
              className="w-full h-full object-contain p-4"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="bg-black/60 rounded-full p-3">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Bilgiler */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="text-[#CC0000] text-sm uppercase tracking-widest mb-1">{t('wheelCover')}</p>
              <h1 className="text-4xl font-black text-white mb-1">{product.model_code}</h1>
              <p className="text-white/50 text-lg">{product.size_inch}" {t('inch')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/50 text-sm">{t('modelCode')}</span>
                <span className="font-mono text-white font-bold">{product.model_code}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/50 text-sm">{t('size')}</span>
                <span className="text-white font-bold">{product.size_inch}"</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/50 text-sm">{t('color')}</span>
                <span className="text-white font-bold">{colorLabel}</span>
              </div>
              {product.price && (
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/50 text-sm">Fiyat</span>
                  <span className="text-[#CC0000] font-black text-xl">₺{product.price.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {product.in_stock === false && (
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/50 text-sm">Stok</span>
                  <span className="text-red-400 font-bold text-sm">Stokta Yok</span>
                </div>
              )}
              {(() => {
                const cars = product.compatible_cars && product.compatible_cars.length > 0
                  ? product.compatible_cars
                  : VEHICLES.filter(v => v.sizes.includes(product.size_inch)).map(v => `${v.brand} ${v.model}`)
                return cars.length > 0 ? (
                  <div className="py-3 border-b border-white/10">
                    <span className="text-white/50 text-sm block mb-2">Uyumlu Araçlar</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cars.map(car => (
                        <span key={car} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                          {car}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}
            </div>

            <a
              href={`https://wa.me/905436190346?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t('whatsapp')}
            </a>
          </div>
        </div>

        {/* Aynı modelin diğer renkleri */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-white/50 text-sm uppercase tracking-widest mb-4">
              {t('otherColors')}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {related.map(r => {
                const rImg = r.image_url || `/products/${r.model_code}_${r.size_inch}inc.webp`
                return (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/products/${r.id}`)}
                    className="bg-[#2d2d2d] rounded-xl p-2 border border-white/10 hover:border-[#CC0000]/50 transition-all w-24"
                  >
                    <div className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rImg} alt={r.model_code} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-center text-white/60 mt-1">{r.model_code}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Zoom overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setZoomed(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.model_code}
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}