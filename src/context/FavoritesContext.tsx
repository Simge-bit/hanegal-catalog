'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getFavoriteIds, addFavorite, removeFavorite, mergeLocalFavorites } from '@/lib/supabase'

const LOCAL_KEY = 'hanegal-favs'

interface FavoritesContextType {
  favorites: string[]
  toggle: (id: string) => void
  isFav: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session, role } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const cloudActive = !!session && role === 'customer'

  // Anonim kullanıcı: localStorage'dan yükle
  useEffect(() => {
    if (cloudActive) return
    const saved = localStorage.getItem(LOCAL_KEY)
    setFavorites(saved ? JSON.parse(saved) : [])
  }, [cloudActive])

  // Müşteri girişi yapılınca: yerel favorileri buluta taşı, buluttan oku
  useEffect(() => {
    if (!cloudActive || !session) return
    const userId = session.user.id
    let cancelled = false
    async function sync() {
      const local: string[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
      if (local.length) await mergeLocalFavorites(userId, local)
      const cloud = await getFavoriteIds(userId)
      if (!cancelled) {
        setFavorites(cloud)
        localStorage.removeItem(LOCAL_KEY)
      }
    }
    sync()
    return () => { cancelled = true }
  }, [cloudActive, session])

  function toggle(id: string) {
    const has = favorites.includes(id)
    const next = has ? favorites.filter(f => f !== id) : [...favorites, id]
    setFavorites(next)

    if (cloudActive && session) {
      const op = has ? removeFavorite(session.user.id, id) : addFavorite(session.user.id, id)
      op.catch(() => setFavorites(favorites))
    } else {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
    }
  }

  const isFav = (id: string) => favorites.includes(id)

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFav }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
