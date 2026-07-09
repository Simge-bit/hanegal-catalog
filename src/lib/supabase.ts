import { createClient } from '@supabase/supabase-js'
import { Product } from '@/types/product'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getProducts(filters?: {
  size?: number
  color?: string
  search?: string
  activeOnly?: boolean
}) {
  let query = supabase.from('products').select('*').order('model_code')

  if (filters?.activeOnly !== false) query = query.eq('is_active', true)
  if (filters?.size) query = query.eq('size_inch', filters.size)
  if (filters?.color) query = query.eq('color_variant', filters.color)
  if (filters?.search) query = query.ilike('model_code', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Product
}

export async function upsertProduct(product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(file: File, modelCode: string) {
  const ext = file.name.split('.').pop()
  const path = `${modelCode}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error || !data) return DEFAULT_SETTINGS
  return {
    whatsapp_number: data.whatsapp_number,
    hero_tagline_tr: data.hero_tagline_tr,
    hero_tagline_en: data.hero_tagline_en,
    footer_slogan_tr: data.footer_slogan_tr,
    footer_slogan_en: data.footer_slogan_en,
  }
}

export async function updateSettings(settings: SiteSettings) {
  const { error } = await supabase.from('site_settings').update(settings).eq('id', 1)
  if (error) throw error
}

export type UserRole = 'admin' | 'customer'

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return (data?.role as UserRole) ?? 'customer'
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('customer_favorites').select('product_id').eq('user_id', userId)
  if (error) throw error
  return data.map(r => r.product_id as string)
}

export async function addFavorite(userId: string, productId: string) {
  const { error } = await supabase.from('customer_favorites').insert({ user_id: userId, product_id: productId })
  if (error) throw error
}

export async function removeFavorite(userId: string, productId: string) {
  const { error } = await supabase.from('customer_favorites').delete().eq('user_id', userId).eq('product_id', productId)
  if (error) throw error
}

export async function mergeLocalFavorites(userId: string, productIds: string[]) {
  if (!productIds.length) return
  const rows = productIds.map(product_id => ({ user_id: userId, product_id }))
  const { error } = await supabase.from('customer_favorites').upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: true })
  if (error) throw error
}