'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings'
import { getSettings } from '@/lib/supabase'

interface SettingsContextType {
  settings: SiteSettings
  refresh: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  function refresh() {
    getSettings().then(setSettings).catch(() => setSettings(DEFAULT_SETTINGS))
  }

  useEffect(() => { refresh() }, [])

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
