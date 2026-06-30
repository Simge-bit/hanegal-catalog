'use client'
import { useLang } from '@/context/LangContext'
import { SIZE_OPTIONS, ColorVariant } from '@/types/product'
import { Search, X, Car } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Vehicle {
  brand: string
  model: string
  sizes: number[]
}

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    fetch('/vehicles.json').then(r => r.json()).then(setVehicles)
  }, [])

  const brands = [...new Set(vehicles.map(v => v.brand))].sort()
  const models = vehicles.filter(v => v.brand === selectedBrand)

  const handleBrand = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedModel('')
    onSize('')
  }

  const handleModel = (modelName: string) => {
    setSelectedModel(modelName)
    const vehicle = vehicles.find(v => v.brand === selectedBrand && v.model === modelName)
    if (vehicle && vehicle.sizes.length === 1) {
      onSize(String(vehicle.sizes[0]))
    } else {
      onSize('')
    }
  }

  const clearVehicle = () => {
    setSelectedBrand('')
    setSelectedModel('')
    onSize('')
  }

  const hasFilters = search || size || color || selectedBrand

  const compatibleSizes = selectedModel
    ? vehicles.find(v => v.brand === selectedBrand && v.model === selectedModel)?.sizes ?? []
    : []

  return (
    <div className="space-y-3">
      {/* Araç uyumluluk filtresi */}
      <div className="bg-[#2d2d2d] border border-white/10 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-1">
          <Car className="w-3.5 h-3.5" />
          {lang === 'tr' ? 'Aracıma Uygun Ürünler' : 'Compatible with My Car'}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedBrand}
            onChange={e => handleBrand(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000]/50 transition-colors"
          >
            <option value="">{lang === 'tr' ? 'Marka seç' : 'Select brand'}</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {selectedBrand && (
            <select
              value={selectedModel}
              onChange={e => handleModel(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000]/50 transition-colors"
            >
              <option value="">{lang === 'tr' ? 'Model seç' : 'Select model'}</option>
              {models.map(v => <option key={v.model} value={v.model}>{v.model}</option>)}
            </select>
          )}

          {selectedModel && compatibleSizes.length > 1 && (
            <div className="flex gap-1 items-center flex-wrap">
              {compatibleSizes.map(s => (
                <button
                  key={s}
                  onClick={() => onSize(size === String(s) ? '' : String(s))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    size === String(s)
                      ? 'bg-[#CC0000] border-[#CC0000] text-white'
                      : 'bg-[#1a1a1a] border-white/10 text-white/70 hover:border-[#CC0000]/50'
                  }`}
                >
                  {s}"
                </button>
              ))}
            </div>
          )}

          {selectedBrand && (
            <button onClick={clearVehicle} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
            onClick={() => { onSearch(''); onSize(''); onColor(''); clearVehicle() }}
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