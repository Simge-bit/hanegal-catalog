'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole } from '@/lib/supabase'
import { useLang } from '@/context/LangContext'
import Header from '@/components/Header'

export default function CustomerLogin() {
  const router = useRouter()
  const { t } = useLang()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setInfo(t('checkEmailToConfirm'))
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else if ((await getUserRole(data.user.id)) === 'admin') {
        await supabase.auth.signOut()
        setError(t('useAdminLoginInstead'))
      } else {
        router.push('/favorites')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#CC0000] italic mb-1">Hanegal</h1>
            <p className="text-white/40 text-sm">{mode === 'signin' ? t('customerLogin') : t('customerSignup')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#2d2d2d] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
            {info && (
              <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? t('loading') : mode === 'signin' ? t('login') : t('signUp')}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
            className="w-full text-center text-white/40 hover:text-white text-sm mt-4 transition-colors"
          >
            {mode === 'signin' ? t('needAccount') : t('haveAccount')}
          </button>
        </div>
      </main>
    </div>
  )
}
