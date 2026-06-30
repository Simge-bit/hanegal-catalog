'use client'
import { Product, COLOR_LABELS } from '@/types/product'
import { useLang } from '@/context/LangContext'
import Link from 'next/link'

const COLOR_BADGE: Record<string, string> = {
  silver: 'bg-gray-300 text-gray-800',
  black_chrome: 'bg-gray-800 text-gray-200 border border-gray-600',
  bicolor: 'bg-gradient-to-r from-gray-800 to-gray-300 text-white',
  black: 'bg-black text-white border border-gray-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const { lang } = useLang()
  const colorLabel = COLOR_LABELS[product.color_variant]?.[lang] ?? product.color_variant

  const imgSrc = product.image_url || `/products/${product.model_code}_${product.size_inch}inc.webp`

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-[#2d2d2d] rounded-xl overflow-hidden border border-white/5 hover:border-[#CC0000]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#CC0000]/10 cursor-pointer">
        <div className="relative aspect-square bg-gradient-to-b from-[#3a3a3a] to-[#2d2d2d] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`${product.model_code} ${product.size_inch} İnç Jant Kapağı`}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-white text-sm">{product.model_code}</p>
              <p className="text-white/50 text-xs">{product.size_inch}"</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${COLOR_BADGE[product.color_variant]}`}>
              {colorLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}