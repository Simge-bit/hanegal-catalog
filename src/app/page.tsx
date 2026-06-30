'use client'
import { useEffect, useState, useMemo } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import FilterBar from '@/components/FilterBar'
import { Product } from '@/types/product'
import { useLang } from '@/context/LangContext'

export default function Home() {
  const { t } = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    fetch('/products.json')
      .then(r => r.json())
      .then((data: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) => {
        const withIds = data.map((p, i) => ({
          ...p,
          id: String(i + 1),
          created_at: '',
          updated_at: '',
        }))
        setProducts(withIds)
      })
      .finally(() => setLoading(false))
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
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] py-12 px-4 text-center border-b border-white/5">
        <div className="absolute inset-0 bg-[#CC0000]/5" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-[#CC0000] italic tracking-tight mb-2">
            Hanegal
          </h1>
          <p className="text-white/50 text-sm uppercase tracking-widest mb-6">
            {t('heroSubtitle')}
          </p>
          <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-full px-4 py-2 text-sm text-white/70">
            <span className="w-2 h-2 rounded-full bg-[#CC0000] animate-pulse" />
            {products.length} {t('productModels')}
          </div>
        </div>
      </section>

      {/* Katalog */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <FilterBar
          search={search}
          size={size}
          color={color}
          onSearch={setSearch}
          onSize={setSize}
          onColor={setColor}
          total={filtered.length}
        />

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
      <footer className="border-t border-white/5 py-6 text-center text-white/30 text-xs">
        {t('allRightsReserved')}
      </footer>
    </div>
  )
}