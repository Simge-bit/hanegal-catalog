'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoritesContextType {
  favorites: string[]
  toggle: (id: string) => void
  isFav: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('hanegal-favs')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  const toggle = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('hanegal-favs', JSON.stringify(next))
      return next
    })
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