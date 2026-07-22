import { Product } from '@/types/product'
import { getProducts } from './supabase'

type RawProducts = {
  jsonProducts: Product[]
  dbProducts: Product[]
}

// Module-level cache: survives across client-side route changes (same JS
// execution context), so navigating back to a page that already fetched
// products renders with full content on the very first paint instead of
// flashing a loading spinner. That's what lets the browser/Next.js restore
// the previous scroll position correctly on back navigation.
let cache: RawProducts | null = null
let pending: Promise<RawProducts> | null = null

async function loadFromJson(): Promise<Product[]> {
  const res = await fetch('/products.json')
  const data: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = await res.json()
  return data.map((p, i) => ({ ...p, id: String(i + 1), created_at: '', updated_at: '' }))
}

export function getRawProducts(): Promise<RawProducts> {
  if (cache) return Promise.resolve(cache)
  if (!pending) {
    pending = Promise.all([
      loadFromJson(),
      getProducts({ activeOnly: false }).catch(() => [] as Product[]),
    ]).then(([jsonProducts, dbProducts]) => {
      cache = { jsonProducts, dbProducts }
      pending = null
      return cache
    })
  }
  return pending
}

export function getCachedRawProducts(): RawProducts | null {
  return cache
}
