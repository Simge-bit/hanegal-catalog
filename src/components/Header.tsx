'use client'
import { useLang } from '@/context/LangContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  const { lang, setLang, t } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#CC0000]/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#CC0000] font-black text-2xl italic tracking-tight">
            Hanegal
          </span>
          <span className="text-white/50 text-xs mt-1">{lang === 'tr' ? 'KATALOG 2026' : 'CATALOG 2026'}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
          <Link href="/products" className="hover:text-white transition-colors">{t('products')}</Link>
          <a
            href={`https://wa.me/905438022477?text=${encodeURIComponent(lang === 'tr' ? 'Merhaba, Hanegal jant kapakları hakkında bilgi almak istiyorum.' : 'Hello, I would like to get information about Hanegal wheel covers.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            {t('contact')}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="px-3 py-1 text-xs border border-white/20 rounded-full hover:border-[#CC0000] hover:text-[#CC0000] transition-colors"
          >
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
        </div>
      </div>
    </header>
  )
}