'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types/product'
import { useFavorites } from '@/context/FavoritesContext'
import { useLang } from '@/context/LangContext'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const { t } = useLang()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    import('@/lib/supabase').then(({ getProducts }) =>
      getProducts({ activeOnly: true })
    ).then(data => {
      if (data.length > 0) {
        setProducts(data)
      } else {
        throw new Error('empty')
      }
    }).catch(() => {
      fetch('/products.json')
        .then(r => r.json())
        .then((data: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) => {
          setProducts(data.map((p, i) => ({ ...p, id: String(i + 1), created_at: '', updated_at: '' })))
        })
    })
  }, [])

  const favProducts = products.filter(p => favorites.includes(p.id))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 fill-[#CC0000] text-[#CC0000]" />
          <h1 className="text-2xl font-black text-white">
            {t('favorites')}
          </h1>
          <span className="text-white/40 text-sm">({favProducts.length})</span>
        </div>

        {favProducts.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-4">{t('noFavorites')}</p>
            <Link href="/" className="text-[#CC0000] hover:underline text-sm">
              {t('browseCatalog')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {favProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}