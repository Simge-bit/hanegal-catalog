'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LangContext'
import { LogOut, Settings, LayoutGrid } from 'lucide-react'

export default function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const tabs = [
    { href: '/admin/products', label: t('products'), icon: LayoutGrid },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#2d2d2d] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[#CC0000] font-black text-xl italic">Hanegal</span>
          <span className="text-white/30 text-xs hidden sm:inline">{t('adminPanel')}</span>
        </div>

        <nav className="flex items-center gap-1 bg-[#1a1a1a] rounded-xl p-1">
          {tabs.map(tab => {
            const active = pathname === tab.href
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  active ? 'bg-[#CC0000] text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-white/50 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors"
          >
            Siteye Git
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> {t('logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
