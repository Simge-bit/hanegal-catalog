'use client'
import { useLang } from '@/context/LangContext'
import { SIZE_OPTIONS, ColorVariant } from '@/types/product'
import { Search, X } from 'lucide-react'

interface FilterBarProps {
  search: string
  size: string
  color: string
  onSearch: (v: string) => void
  onSize: (v: string) => void
  onColor: (v: string) => void
  total: number
}

const COLORS: { value: ColorVariant | ''; labelTr: string; labelEn: string }[] = [
  { value: '', labelTr: 'Tüm Renkler', labelEn: 'All Colors' },
  { value: 'silver', labelTr: 'Gümüş', labelEn: 'Silver' },
  { value: 'black_chrome', labelTr: 'Siyah Krom', labelEn: 'Black Chrome' },
  { value: 'bicolor', labelTr: 'Siyah & Gümüş', labelEn: 'Black & Silver' },
  { value: 'black', labelTr: 'Siyah', labelEn: 'Black' },
]

export default function FilterBar({ search, size, color, onSearch, onSize, onColor, total }: FilterBarProps) {
  const { lang, t } = useLang()

  const hasFilters = search || size || color

  return (
    <div className="space-y-3">
      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full bg-[#2d2d2d] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#CC0000]/50 transition-colors"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        {/* Boyut filtresi */}
        <select
          value={size}
          onChange={e => onSize(e.target.value)}
          className="bg-[#2d2d2d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000]/50 transition-colors"
        >
          <option value="">{t('allSizes')}</option>
          {SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>{s}"</option>
          ))}
        </select>

        {/* Renk filtresi */}
        <select
          value={color}
          onChange={e => onColor(e.target.value)}
          className="bg-[#2d2d2d] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000]/50 transition-colors"
        >
          {COLORS.map(c => (
            <option key={c.value} value={c.value}>
              {lang === 'tr' ? c.labelTr : c.labelEn}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { onSearch(''); onSize(''); onColor('') }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-[#CC0000] border border-[#CC0000]/30 rounded-xl hover:bg-[#CC0000]/10 transition-colors"
          >
            <X className="w-3 h-3" /> {t('clearFilter')}
          </button>
        )}

        <span className="ml-auto text-white/40 text-sm self-center">
          {total} {t('productCount')}
        </span>
      </div>
    </div>
  )
}