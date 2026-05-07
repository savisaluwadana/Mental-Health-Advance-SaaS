'use client'

import { useEffect, useState } from 'react'

const SEEN_KEY = 'safespace_lanka_lang_picked'
const LS_KEY = 'safespace_lanka_lang'

const LANGUAGES = [
  {
    code: '',
    label: 'English',
    native: 'English',
    short: 'EN',
    greeting: 'Welcome',
    sub: 'Continue in English',
  },
  {
    code: 'si',
    label: 'Sinhala',
    native: 'සිංහල',
    short: 'SI',
    greeting: 'ආයුබෝවන්',
    sub: 'සිංහලෙන් දිගටම යන්න',
  },
  {
    code: 'ta',
    label: 'Tamil',
    native: 'தமிழ்',
    short: 'TA',
    greeting: 'வணக்கம்',
    sub: 'தமிழில் தொடரவும்',
  },
]

function triggerTranslation(langCode: string) {
  const selectEl = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (selectEl) {
    selectEl.value = langCode
    selectEl.dispatchEvent(new Event('change'))
    return true
  }
  return false
}

function resetToEnglish() {
  try {
    const el = (window as any).google?.translate?.TranslateElement?.getInstance?.()
    if (el && typeof el.restoreOriginalContent === 'function') {
      el.restoreOriginalContent()
      return
    }
  } catch (_) {}

  const clearCookie = (name: string) => {
    const paths = ['/', window.location.pathname]
    const domains = [window.location.hostname, '.' + window.location.hostname, '']
    for (const path of paths) {
      for (const domain of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
      }
    }
  }
  clearCookie('googtrans')
}

export function LanguagePickerModal() {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  // Show modal only if user hasn't picked a language before
  useEffect(() => {
    const alreadySeen = localStorage.getItem(SEEN_KEY)
    if (!alreadySeen) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  const handlePick = (lang: typeof LANGUAGES[0]) => {
    setSelected(lang.code)
    // Brief pause so the user sees the selection highlight
    setTimeout(() => {
      localStorage.setItem(SEEN_KEY, '1')
      localStorage.setItem(LS_KEY, lang.code)

      if (lang.code === '') {
        resetToEnglish()
      } else {
        // Retry until widget is ready
        const attempt = (retries: number) => {
          const ok = triggerTranslation(lang.code)
          if (!ok && retries > 0) setTimeout(() => attempt(retries - 1), 250)
        }
        attempt(12)
      }

      setLeaving(true)
      setTimeout(() => setVisible(false), 350)
    }, 280)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          leaving ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${
          leaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Choose your language"
      >
        <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Top gradient banner */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 pt-10 pb-8 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">SafeSpace Lanka</h1>
              <p className="text-brand-200 text-sm">Choose your preferred language to continue</p>
              <p className="text-brand-300 text-xs mt-0.5">
                ඔබට ඕනෑ භාෂාව තෝරන්න · உங்கள் மொழியை தேர்ந்தெடுக்கவும்
              </p>
            </div>
          </div>

          {/* Language options */}
          <div className="p-6 space-y-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.code
              return (
                <button
                  key={lang.code}
                  id={`lang-pick-${lang.code || 'en'}`}
                  onClick={() => handlePick(lang)}
                  disabled={selected !== null}
                  className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 group ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 shadow-md scale-[1.02]'
                      : 'border-border hover:border-brand-300 hover:bg-accent hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {lang.short}
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base transition-colors ${
                      isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-foreground'
                    }`}>
                      {lang.greeting}
                    </p>
                    <p className={`text-sm transition-colors ${
                      isSelected ? 'text-brand-500 dark:text-brand-400' : 'text-muted-foreground'
                    }`}>
                      {lang.sub}
                    </p>
                  </div>

                  {/* Language label badge */}
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-muted text-muted-foreground group-hover:bg-brand-100 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300'
                  }`}>
                    {lang.native}
                  </span>

                  {/* Checkmark */}
                  <div className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-muted-foreground/30 group-hover:border-brand-400'
                  }`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="px-6 pb-6">
            <p className="text-center text-xs text-muted-foreground">
              You can change the language anytime from the{' '}
              <span className="font-medium text-foreground">language menu</span> in the navigation bar.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
