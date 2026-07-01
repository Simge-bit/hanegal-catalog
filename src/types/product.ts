export type ColorVariant = 'silver' | 'black_chrome' | 'bicolor' | 'black'

export interface Product {
  id: string
  model_code: string
  base_model: string
  size_inch: number
  color_variant: ColorVariant
  image_url: string | null
  is_active: boolean
  in_stock?: boolean
  price?: number | null
  compatible_cars?: string[]
  created_at: string
  updated_at: string
}

export const COLOR_LABELS: Record<ColorVariant, { tr: string; en: string }> = {
  silver: { tr: 'Gümüş', en: 'Silver' },
  black_chrome: { tr: 'Siyah Krom', en: 'Black Chrome' },
  bicolor: { tr: 'Siyah & Gümüş', en: 'Black & Silver' },
  black: { tr: 'Siyah', en: 'Black' },
}

export const SIZE_OPTIONS = [12, 13, 14, 15, 16]