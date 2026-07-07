export interface SiteSettings {
  whatsapp_number: string
  hero_tagline_tr: string
  hero_tagline_en: string
  footer_slogan_tr: string
  footer_slogan_en: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '905436190346',
  hero_tagline_tr: 'Türkiye\'nin önde gelen jant kapağı üreticisi. Kalite ve uyum bir arada.',
  hero_tagline_en: 'Leading wheel cover manufacturer in Turkey. Quality and compatibility together.',
  footer_slogan_tr: 'Kaliteli jant kapağı, uygun fiyat.',
  footer_slogan_en: 'Quality wheel covers at the right price.',
}
