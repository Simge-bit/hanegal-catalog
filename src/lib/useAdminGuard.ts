'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function useAdminGuard() {
  const { session, role, loading } = useAuth()
  const router = useRouter()
  const authorized = !loading && !!session && role === 'admin'

  useEffect(() => {
    if (!loading && !authorized) router.push('/admin/login')
  }, [loading, authorized, router])

  return { ready: authorized }
}
