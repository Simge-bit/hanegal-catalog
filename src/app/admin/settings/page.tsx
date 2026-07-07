'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getSettings, updateSettings } from '@/lib/supabase'
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings'
import { useLang } from '@/context/LangContext'
import { useSettings } from '@/context/SettingsContext'
import AdminHeader from '@/components/AdminHeader'
import { Check } from 'lucide-react'

export default function AdminSettings() {
  const router = useRouter()
  const { t } = useLang()
  const { refresh } = useSettings()
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [credSaving, setCredSaving] = useState(false)
  const [credError, setCredError] = useState('')
  const [credSaved, setCredSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/admin/login')
      setCurrentEmail(data.session?.user.email || '')
    })
    getSettings().then(s => { setForm(s); setLoading(false) })
  }, [])

  async function handleSaveSettings() {
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(form)
      refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert('Kaydetme hatası: ' + (e as Error).message)
    }
    setSaving(false)
  }

  async function handleUpdateCredentials(e: React.FormEvent) {
    e.preventDefault()
    setCredError('')
    setCredSaved(false)
    if (newPassword && newPassword !== confirmPassword) {
      setCredError(t('passwordsDontMatch'))
      return
    }
    const payload: { email?: string; password?: string } = {}
    if (newEmail) payload.email = newEmail
    if (newPassword) payload.password = newPassword
    if (!payload.email && !payload.password) return

    setCredSaving(true)
    const { error } = await supabase.auth.updateUser(payload)
    if (error) {
      setCredError(error.message)
    } else {
      setCredSaved(true)
      setNewEmail('')
      setNewPassword('')
      setConfirmPassword('')
      if (payload.email) setCurrentEmail(payload.email)
    }
    setCredSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <AdminHeader />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Site Ayarları */}
            <div className="bg-[#2d2d2d] rounded-2xl p-6 space-y-4 border border-white/5">
              <h2 className="text-white font-bold">{t('siteSettings')}</h2>

              <div>
                <label className="block text-white/60 text-sm mb-1">{t('whatsappNumber')}</label>
                <input
                  type="text"
                  value={form.whatsapp_number}
                  onChange={e => setForm({ ...form, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
                <p className="text-white/30 text-xs mt-1">{t('whatsappNumberHint')}</p>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">{t('heroTaglineTr')}</label>
                <textarea
                  value={form.hero_tagline_tr}
                  onChange={e => setForm({ ...form, hero_tagline_tr: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">{t('heroTaglineEn')}</label>
                <textarea
                  value={form.hero_tagline_en}
                  onChange={e => setForm({ ...form, hero_tagline_en: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">{t('footerSloganTr')}</label>
                <input
                  type="text"
                  value={form.footer_slogan_tr}
                  onChange={e => setForm({ ...form, footer_slogan_tr: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">{t('footerSloganEn')}</label>
                <input
                  type="text"
                  value={form.footer_slogan_en}
                  onChange={e => setForm({ ...form, footer_slogan_en: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                {saved && <Check className="w-4 h-4" />}
                {saving ? t('loading') : saved ? t('settingsSaved') : t('saveSettings')}
              </button>
            </div>

            {/* Giriş Bilgileri */}
            <form onSubmit={handleUpdateCredentials} className="bg-[#2d2d2d] rounded-2xl p-6 space-y-4 border border-white/5">
              <h2 className="text-white font-bold">{t('adminCredentials')}</h2>

              <div>
                <label className="block text-white/60 text-sm mb-1">{t('currentEmail')}</label>
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/40 text-sm"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">{t('newEmail')}</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CC0000]/50 transition-colors"
                />
              </div>

              {credError && (
                <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{credError}</p>
              )}
              {credSaved && (
                <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2">{t('credentialsUpdated')}</p>
              )}

              <button
                type="submit"
                disabled={credSaving}
                className="bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                {credSaving ? t('loading') : t('updateCredentials')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
