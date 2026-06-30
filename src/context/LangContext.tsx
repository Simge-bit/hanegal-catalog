'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'tr' | 'en'

const translations = {
  tr: {
    catalog: 'Katalog',
    products: 'Ürünler',
    search: 'Model ara...',
    allSizes: 'Tüm Boyutlar',
    allColors: 'Tüm Renkler',
    size: 'Boyut',
    color: 'Renk',
    modelCode: 'Model Kodu',
    noProducts: 'Ürün bulunamadı',
    home: 'Anasayfa',
    contact: 'İletişim',
    inch: 'İnç',
    whatsapp: 'WhatsApp ile Ulaş',
    filterBy: 'Filtrele',
    silver: 'Gümüş',
    black_chrome: 'Siyah Krom',
    bicolor: 'Siyah & Gümüş',
    black: 'Siyah',
    adminPanel: 'Admin Paneli',
    addProduct: 'Ürün Ekle',
    editProduct: 'Ürün Düzenle',
    deleteProduct: 'Ürün Sil',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    active: 'Aktif',
    passive: 'Pasif',
    uploadImage: 'Görsel Yükle',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    email: 'E-posta',
    password: 'Şifre',
    loading: 'Yükleniyor...',
    productCount: 'ürün',
    heroSubtitle: 'Jant Kapağı Kataloğu 2026',
    productModels: 'Ürün Modeli',
    allRightsReserved: '© 2026 Hanegal. Tüm hakları saklıdır.',
    wheelCover: 'Jant Kapağı',
    otherColors: 'Diğer Renkler',
    clearFilter: 'Temizle',
    whatsappMsg: 'Merhaba, {model} - {size} inc modeli hakkında bilgi almak istiyorum.',
    whatsappGeneral: 'Merhaba, Hanegal jant kapakları hakkında bilgi almak istiyorum.',
    favorites: 'Favorilerim',
    noFavorites: 'Henüz favori eklemediniz.',
    browseCatalog: 'Kataloğa göz at',
    feat1Title: 'Araç Uyumluluğu',
    feat1Desc: 'Hangi araca hangi ürün gerektiğini filtreden saniyeler içinde bulun.',
    feat2Title: 'Geniş Ürün Yelpazesi',
    feat2Desc: '13\'ten 16 inç\'e, gümüş, siyah krom ve bicolor renk seçenekleri.',
    feat3Title: 'Anında WhatsApp Destek',
    feat3Desc: 'Ürün sayfasından tek tıkla WhatsApp\'ta iletişime geçin.',
    footerContact: 'İletişim',
    footerCatalog: 'Katalog',
    footerSlogan: 'Kaliteli jant kapağı, uygun fiyat.',
    whatsappLine: 'WhatsApp',
  },
  en: {
    catalog: 'Catalog',
    products: 'Products',
    search: 'Search model...',
    allSizes: 'All Sizes',
    allColors: 'All Colors',
    size: 'Size',
    color: 'Color',
    modelCode: 'Model Code',
    noProducts: 'No products found',
    home: 'Home',
    contact: 'Contact',
    inch: 'Inch',
    whatsapp: 'Contact via WhatsApp',
    filterBy: 'Filter',
    silver: 'Silver',
    black_chrome: 'Black Chrome',
    bicolor: 'Black & Silver',
    black: 'Black',
    adminPanel: 'Admin Panel',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    active: 'Active',
    passive: 'Passive',
    uploadImage: 'Upload Image',
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    loading: 'Loading...',
    productCount: 'products',
    heroSubtitle: 'Wheel Cover Catalog 2026',
    productModels: 'Product Models',
    allRightsReserved: '© 2026 Hanegal. All rights reserved.',
    wheelCover: 'Wheel Cover',
    otherColors: 'Other Colors',
    clearFilter: 'Clear',
    whatsappMsg: 'Hello, I would like to get information about the {model} - {size} inch model.',
    whatsappGeneral: 'Hello, I would like to get information about Hanegal wheel covers.',
    favorites: 'My Favorites',
    noFavorites: 'No favorites yet.',
    browseCatalog: 'Browse catalog',
    feat1Title: 'Vehicle Compatibility',
    feat1Desc: 'Find the right product for your car in seconds with our filter.',
    feat2Title: 'Wide Product Range',
    feat2Desc: 'From 13 to 16 inch, in silver, black chrome and bicolor options.',
    feat3Title: 'Instant WhatsApp Support',
    feat3Desc: 'Contact us directly via WhatsApp with one click from any product page.',
    footerContact: 'Contact',
    footerCatalog: 'Catalog',
    footerSlogan: 'Quality wheel covers at the right price.',
    whatsappLine: 'WhatsApp',
  },
}

type TranslationKey = keyof typeof translations.tr

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('tr')
  const t = (key: TranslationKey) => (translations[lang] as Record<string, string>)[key]
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}