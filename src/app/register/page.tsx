'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa']
const LANGUAGES = ['English', 'Sinhala', 'Tamil']

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'client' | 'psychologist' | 'psychiatrist' | 'counsellor',
    phone: '',
    province: '',
    languages: [] as string[],
    slmcRegNo: '',
    slmcCertificateDataUrl: '',
    nicDocumentDataUrl: '',
    specialty: '',
    sessionTypes: [] as ('online' | 'physical')[],
  })

  const isPractitioner = form.role === 'psychologist' || form.role === 'psychiatrist' || form.role === 'counsellor'

  const toggleLanguage = (lang: string) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(lang) ? f.languages.filter((l) => l !== lang) : [...f.languages, lang],
    }))
  }

  const toggleSessionType = (type: 'online' | 'physical') => {
    setForm((f) => ({
      ...f,
      sessionTypes: f.sessionTypes.includes(type) ? f.sessionTypes.filter((t) => t !== type) : [...f.sessionTypes, type],
    }))
  }

  const handleFileUpload = (file: File | undefined, field: 'slmcCertificateDataUrl' | 'nicDocumentDataUrl') => {
    if (!file) return
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Please upload a file under 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, [field]: (ev.target?.result as string) || '' }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        const errors = Object.values(data.error || {}).flat()
        toast.error((errors[0] as string) || 'Registration failed')
        setLoading(false)
        return
      }

      toast.success('Account created! Signing you in…')
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })

      if (signInResult?.ok) {
        const dashPath = form.role === 'client' ? '/dashboard/client' : '/dashboard/practitioner'
        router.push(dashPath)
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-background to-background dark:from-brand-950/10" />

      <div className="w-full max-w-lg animate-slide-up py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold">SafeSpace<span className="text-brand-600"> Lanka</span></span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join SafeSpace Lanka — your mental health journey starts here</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="label block mb-2">I am a…</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['client', 'psychologist', 'psychiatrist', 'counsellor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all capitalize ${
                      form.role === r
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-600'
                        : 'border-border hover:border-brand-300 hover:bg-muted'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="reg-name" className="label block mb-1.5">Full name</label>
                <input id="reg-name" type="text" required className="input-field w-full" placeholder="Priya Silva"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label htmlFor="reg-email" className="label block mb-1.5">Email address</label>
                <input id="reg-email" type="email" required className="input-field w-full" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label htmlFor="reg-password" className="label block mb-1.5">Password <span className="text-muted-foreground text-xs">(min 8 characters)</span></label>
                <input id="reg-password" type="password" required minLength={8} className="input-field w-full" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label htmlFor="reg-phone" className="label block mb-1.5">Phone <span className="text-muted-foreground text-xs">(optional)</span></label>
                <input id="reg-phone" type="tel" className="input-field w-full" placeholder="+94 77 123 4567"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label htmlFor="reg-province" className="label block mb-1.5">Province</label>
                <select id="reg-province" className="input-field w-full"
                  value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="label block mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang} type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full border px-3 py-1 text-sm transition-all ${
                      form.languages.includes(lang)
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-600'
                        : 'border-border hover:border-brand-300'
                    }`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Practitioner-only fields */}
            {isPractitioner && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-4 dark:bg-brand-900/10 dark:border-brand-800">
                <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wide">Practitioner Details</p>
                <div>
                  <label htmlFor="reg-slmc" className="label block mb-1.5">SLMC Registration Number <span className="text-red-500">*</span></label>
                  <input id="reg-slmc" type="text" required={isPractitioner} className="input-field w-full" placeholder="SLMC/12345"
                    value={form.slmcRegNo} onChange={(e) => setForm({ ...form, slmcRegNo: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="reg-slmc-doc" className="label block mb-1.5">SLMC Certificate (PDF or Image) <span className="text-red-500">*</span></label>
                  <input
                    id="reg-slmc-doc"
                    type="file"
                    accept="application/pdf,image/*"
                    required={isPractitioner}
                    className="input-field w-full"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'slmcCertificateDataUrl')}
                  />
                  {form.slmcCertificateDataUrl && (
                    <p className="text-xs text-muted-foreground mt-1">SLMC certificate attached</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-nic-doc" className="label block mb-1.5">NIC / National ID (PDF or Image) <span className="text-red-500">*</span></label>
                  <input
                    id="reg-nic-doc"
                    type="file"
                    accept="application/pdf,image/*"
                    required={isPractitioner}
                    className="input-field w-full"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'nicDocumentDataUrl')}
                  />
                  {form.nicDocumentDataUrl && (
                    <p className="text-xs text-muted-foreground mt-1">NIC document attached</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-specialty" className="label block mb-1.5">Specialty</label>
                  <input id="reg-specialty" type="text" className="input-field w-full" placeholder="e.g. Anxiety, Depression, Family Therapy"
                    value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                </div>
                <div>
                  <label className="label block mb-2">Session Types</label>
                  <div className="flex flex-wrap gap-2">
                    {(['online', 'physical'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => toggleSessionType(t)}
                        className={`rounded-full border px-3 py-1 text-sm transition-all capitalize ${
                          form.sessionTypes.includes(t)
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-600'
                            : 'border-border hover:border-brand-300'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5" id="register-submit">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
