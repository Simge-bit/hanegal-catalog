'use client'
import { useEffect, useState, useMemo } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import FilterBar from '@/components/FilterBar'
import { Product } from '@/types/product'
import { useLang } from '@/context/LangContext'
import { MessageCircle, Shield, Layers, FileDown } from 'lucide-react'
import Link from 'next/link'
import { getProducts } from '@/lib/supabase'

async function loadFromJson(): Promise<Product[]> {
  const res = await fetch('/products.json')
  const data: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = await res.json()
  return data.map((p, i) => ({ ...p, id: String(i + 1), created_at: '', updated_at: '' }))
}

export default function Home() {
  const { lang, t } = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  async function imgToBase64(src: string): Promise<string | null> {
    return new Promise(resolve => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 200
        canvas.height = img.naturalHeight || 200
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
  }

  async function downloadPdf() {
    setPdfLoading(true)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = 210
    const margin = 14
    let y = margin

    doc.setFillColor(26, 26, 26)
    doc.rect(0, 0, pageW, 297, 'F')
    doc.setTextColor(204, 0, 0)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('HANEGAL', margin, y + 10)
    doc.setTextColor(180, 180, 180)
    doc.setFontSize(10)
    doc.text('JANT KAPAGI KATALOGU 2026', margin, y + 18)
    doc.setDrawColor(204, 0, 0)
    doc.line(margin, y + 22, pageW - margin, y + 22)
    y += 30

    const colW = (pageW - margin * 2) / 3
    const cardH = 52
    const imgSize = 30
    let col = 0

    for (const p of products.filter(pr => pr.is_active !== false)) {
      if (col === 0 && y + cardH > 270) {
        doc.addPage()
        doc.setFillColor(26, 26, 26)
        doc.rect(0, 0, pageW, 297, 'F')
        y = margin
      }
      const x = margin + col * colW
      doc.setFillColor(45, 45, 45)
      doc.roundedRect(x, y, colW - 3, cardH, 2, 2, 'F')

      const imgSrc = p.image_url || `/products/${p.model_code}_${p.size_inch}inc.webp`
      const b64 = await imgToBase64(imgSrc)
      if (b64) {
        doc.addImage(b64, 'JPEG', x + 2, y + 2, imgSize, imgSize)
      }

      const tx = x + imgSize + 4
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(p.model_code, tx, y + 10)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(180, 180, 180)
      doc.text(`${p.size_inch}"`, tx, y + 18)
      doc.text(p.color_variant, tx, y + 25)
      if (p.price) {
        doc.setTextColor(204, 0, 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${p.price} TL`, tx, y + 34)
      }

      col++
      if (col >= 3) { col = 0; y += cardH + 3 }
    }

    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('hanegal-catalog.vercel.app | +90 543 619 03 46', pageW / 2, 292, { align: 'center' })
    doc.save('Hanegal-Katalog-2026.pdf')
    setPdfLoading(false)
  }

  useEffect(() => {
    Promise.all([
      loadFromJson(),
      getProducts({ activeOnly: true }).catch(() => [] as Product[]),
    ]).then(([jsonProducts, dbProducts]) => {
      const dbIds = new Set(dbProducts.map(p => p.model_code + '_' + p.size_inch + '_' + p.color_variant))
      const merged = [
        ...dbProducts,
        ...jsonProducts.filter(p => !dbIds.has(p.model_code + '_' + p.size_inch + '_' + p.color_variant)),
      ]
      setProducts(merged)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.is_active) return false
      if (search && !p.model_code.toLowerCase().includes(search.toLowerCase())) return false
      if (size && p.size_inch !== Number(size)) return false
      if (color && p.color_variant !== color) return false
      return true
    })
  }, [products, search, size, color])

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] py-16 px-4 text-center border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[#CC0000]/5" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CC0000]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-[#CC0000] text-xs font-bold uppercase tracking-[0.3em] mb-4 border border-[#CC0000]/30 px-3 py-1 rounded-full">
            {t('heroSubtitle')}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tight mb-4">
            Hane<span className="text-[#CC0000]">gal</span>
          </h1>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            {lang === 'tr'
              ? 'Türkiye\'nin önde gelen jant kapağı üreticisi. Kalite ve uyum bir arada.'
              : 'Leading wheel cover manufacturer in Turkey. Quality and compatibility together.'}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {[
              { value: `${products.length}+`, label: lang === 'tr' ? 'Ürün Modeli' : 'Product Models' },
              { value: '31', label: lang === 'tr' ? 'Araç Modeli' : 'Car Models' },
              { value: '13-16"', label: lang === 'tr' ? 'İnç Aralığı' : 'Inch Range' },
              { value: '4', label: lang === 'tr' ? 'Renk Seçeneği' : 'Color Options' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-[#CC0000]">{stat.value}</div>
                <div className="text-white/40 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#katalog"
              className="px-6 py-3 bg-[#CC0000] hover:bg-[#aa0000] text-white font-bold rounded-full text-sm transition-colors"
            >
              {lang === 'tr' ? 'Kataloğu İncele' : 'Browse Catalog'}
            </a>
            <a
              href={`https://wa.me/905436190346?text=${encodeURIComponent(lang === 'tr' ? 'Merhaba, Hanegal jant kapakları hakkında bilgi almak istiyorum.' : 'Hello, I would like to get information about Hanegal wheel covers.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 hover:border-[#CC0000] text-white/70 hover:text-white font-bold rounded-full text-sm transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-white/5 bg-[#222222]">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: t('feat1Title'), desc: t('feat1Desc') },
            { icon: Layers, title: t('feat2Title'), desc: t('feat2Desc') },
            { icon: MessageCircle, title: t('feat3Title'), desc: t('feat3Desc') },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#CC0000]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Katalog */}
      <main id="katalog" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <FilterBar
              search={search}
              size={size}
              color={color}
              onSearch={setSearch}
              onSize={setSize}
              onColor={setColor}
              total={filtered.length}
            />
          </div>
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            <FileDown className="w-4 h-4" />
            {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-lg">{t('noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#111111] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marka */}
          <div>
            <span className="text-[#CC0000] font-black text-2xl italic">Hanegal</span>
            <p className="text-white/30 text-xs mt-2 leading-relaxed">{t('footerSlogan')}</p>
          </div>

          {/* Linkler */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{t('footerCatalog')}</p>
            <div className="space-y-2">
              <Link href="/products" className="block text-white/40 hover:text-white text-sm transition-colors">
                {t('products')}
              </Link>
              <Link href="/favorites" className="block text-white/40 hover:text-white text-sm transition-colors">
                {t('favorites')}
              </Link>
            </div>
          </div>

          {/* İletişim */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{t('footerContact')}</p>
            <a
              href={`https://wa.me/905436190346`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/40 hover:text-green-400 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              +90 543 619 03 46
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 py-4 flex items-center justify-center gap-4 text-white/20 text-xs">
          <span>{t('allRightsReserved')}</span>
          <span className="text-white/10">·</span>
          <span>Made with <span className="text-[#CC0000]">♥</span> by <span className="text-white/40 font-medium">Simge Solmaz</span></span>
        </div>
      </footer>
    </div>
  )
}