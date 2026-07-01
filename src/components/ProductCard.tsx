'use client'
import { Product, COLOR_LABELS } from '@/types/product'
import { useLang } from '@/context/LangContext'
import { useFavorites } from '@/context/FavoritesContext'
import Link from 'next/link'
import { MessageCircle, Heart } from 'lucide-react'
import { buildWhatsAppMessage } from '@/lib/vehicles'

const COLOR_BADGE: Record<string, string> = {
  silver: 'bg-gray-300 text-gray-800',
  black_chrome: 'bg-gray-800 text-gray-200 border border-gray-600',
  bicolor: 'bg-gradient-to-r from-gray-800 to-gray-300 text-white',
  black: 'bg-black text-white border border-gray-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const { lang } = useLang()
  const { toggle, isFav } = useFavorites()
  const colorLabel = COLOR_LABELS[product.color_variant]?.[lang] ?? product.color_variant
  const fav = isFav(product.id)

  const imgSrc = product.image_url || `/products/${product.model_code}_${product.size_inch}inc.webp`

  const waMsg = encodeURIComponent(
    buildWhatsAppMessage(product.model_code, product.size_inch, colorLabel, lang)
  )

  return (
    <div className="group bg-[#2d2d2d] rounded-xl overflow-hidden border border-white/5 hover:border-[#CC0000]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#CC0000]/10">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-[#2d2d2d] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${imgSrc}?v=2`}
            alt={`${product.model_code} ${product.size_inch} İnç Jant Kapağı`}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={e => { e.preventDefault(); toggle(product.id) }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${fav ? 'fill-[#CC0000] text-[#CC0000]' : 'text-white/50'}`}
            />
          </button>
        </div>
        <div className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-white text-sm">{product.model_code}</p>
              <p className="text-white/50 text-xs">{product.size_inch}"</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${COLOR_BADGE[product.color_variant]}`}>
              {colorLabel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            {product.price ? (
              <span className="text-[#CC0000] font-bold text-sm">₺{product.price.toLocaleString('tr-TR')}</span>
            ) : <span />}
            {product.in_stock === false && (
              <span className="text-xs text-red-400/70">Stokta Yok</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <a
          href={`https://wa.me/905436190346?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-medium transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}