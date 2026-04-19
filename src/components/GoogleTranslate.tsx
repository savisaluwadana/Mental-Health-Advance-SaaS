'use client'

import { useState, useRef, useEffect } from 'react'

declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
  }
}

const LANGUAGES = [
  { code: '', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', native: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇱🇰' },
]

const LS_KEY = 'mindbridge_lang'

// ── Reset to English ──────────────────────────────────────────────────────────
// The official way is restoreOriginalContent(). As a fallback we clear the
// `googtrans` cookie that Google Translate uses to remember the active language
// and reload the page.
function resetToEnglish() {
  try {
    const el = window.google?.translate?.TranslateElement?.getInstance?.()
    if (el && typeof el.restoreOriginalContent === 'function') {
      el.restoreOriginalContent()
      return
    }
  } catch (_) { /* ignore */ }

  // Fallback: wipe the cookie Google Translate relies on and hard-reload
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
  window.location.reload()
}

// ── Switch to a non-English language ─────────────────────────────────────────
function triggerTranslation(langCode: string) {
  const selectEl = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (selectEl) {
    selectEl.value = langCode
    selectEl.dispatchEvent(new Event('change'))
    return true
  }
  return false
}

function GlobeIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  )
}

// ── Initialize Google Translate once globally — hidden from user ──────────────
export function GoogleTranslateInit() {
  useEffect(() => {
    // Block body.style.top setter (Google Translate injects a 40px shift)
    try {
      const bodyStyle = document.body.style
      Object.defineProperty(bodyStyle, 'top', {
        get: () => '0px',
        set: (_val: string) => { /* no-op */ },
        configurable: true,
      })
    } catch (_) {
      const obs = new MutationObserver(() => {
        if (document.body.style.top && document.body.style.top !== '0px') {
          document.body.setAttribute('style',
            document.body.getAttribute('style')?.replace(/top:[^;]+;?/gi, '') || '')
        }
      })
      obs.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    }

    // Hide Google Translate banner frame whenever it appears
    const hideBanner = () => {
      const banner = document.querySelector<HTMLElement>('#goog-gt-tt, .goog-te-banner-frame, .skiptranslate iframe')
      if (banner) {
        banner.style.cssText = 'display:none!important;height:0!important;'
      }
    }
    const domObs = new MutationObserver(hideBanner)
    domObs.observe(document.documentElement, { childList: true, subtree: true })
    hideBanner()

    // Boot the widget
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,si,ta', autoDisplay: false },
          'gt-hidden-element'
        )
        // Restore previously-chosen language (survives Next.js client navigations)
        const saved = localStorage.getItem(LS_KEY)
        if (saved && saved !== '') {
          // Small delay to ensure widget is fully ready
          setTimeout(() => triggerTranslation(saved), 300)
        }
      }
    }

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }

    return () => domObs.disconnect()
  }, [])

  return <div id="gt-hidden-element" className="hidden absolute w-0 h-0 overflow-hidden" aria-hidden="true" />
}

// ── Visible language switcher UI ──────────────────────────────────────────────
export function LanguageSwitcher({ variant = 'navbar' }: { variant?: 'navbar' | 'sidebar' }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(() => {
    // Hydrate from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_KEY)
      return LANGUAGES.find(l => l.code === saved) ?? LANGUAGES[0]
    }
    return LANGUAGES[0]
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (lang: typeof LANGUAGES[0]) => {
    setOpen(false)
    setCurrent(lang)
    localStorage.setItem(LS_KEY, lang.code)

    if (lang.code === '') {
      // ── Reset back to English ──
      resetToEnglish()
    } else {
      // ── Switch to Tamil / Sinhala ──
      // Retry until the widget is ready (can take a moment on first load)
      const attempt = (retries: number) => {
        const ok = triggerTranslation(lang.code)
        if (!ok && retries > 0) setTimeout(() => attempt(retries - 1), 200)
      }
      attempt(10)
    }
  }

  const DropdownItems = () => (
    <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            handleSelect(lang)
          }}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
            current.code === lang.code ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'hover:bg-accent'
          }`}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="font-medium flex-1">{lang.native}</span>
          <span className="text-xs text-muted-foreground">{lang.label}</span>
        </button>
      ))}
    </div>
  )

  if (variant === 'sidebar') {
    return (
      <div ref={ref} className="relative w-full px-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="sidebar-link w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <GlobeIcon />
            <span>{current.native}</span>
          </div>
          <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && <div className="mt-1"><DropdownItems /></div>}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
      >
        <GlobeIcon />
        <span className="hidden sm:inline">{current.native}</span>
        <svg className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[9999] min-w-[175px]">
          <DropdownItems />
        </div>
      )}
    </div>
  )
}
