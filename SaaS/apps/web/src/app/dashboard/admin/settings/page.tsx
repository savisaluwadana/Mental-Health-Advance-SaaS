'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PlatformSettings {
  platformName: string
  registrationsOpen: boolean
  practitionerAutoVerify: boolean
  crisisBannerEnabled: boolean
  maintenanceMode: boolean
  defaultSessionDuration: number
  supportedLanguages: string[]
  supportEmail: string
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'SafeSpace Lanka',
  registrationsOpen: true,
  practitionerAutoVerify: false,
  crisisBannerEnabled: true,
  maintenanceMode: false,
  defaultSessionDuration: 60,
  supportedLanguages: ['English', 'Sinhala', 'Tamil'],
  supportEmail: 'support@safespacelanka.lk',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS)
  const [languageText, setLanguageText] = useState(DEFAULT_SETTINGS.supportedLanguages.join(', '))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        const nextSettings = { ...DEFAULT_SETTINGS, ...data }
        setSettings(nextSettings)
        setLanguageText(nextSettings.supportedLanguages.join(', '))
      })
      .catch(() => toast.error('Could not load platform settings'))
  }, [])

  const setBoolean = (key: keyof Pick<PlatformSettings, 'registrationsOpen' | 'practitionerAutoVerify' | 'crisisBannerEnabled' | 'maintenanceMode'>) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }

  const saveSettings = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...settings,
        supportedLanguages: languageText.split(',').map((language) => language.trim()).filter(Boolean),
        defaultSessionDuration: Number(settings.defaultSessionDuration),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setSettings({ ...DEFAULT_SETTINGS, ...data })
      toast.success('Platform settings saved')
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to save settings')
    }
    setSaving(false)
  }

  const toggles = [
    { key: 'registrationsOpen' as const, label: 'Client registrations', desc: 'Allow new clients to create accounts from the public signup flow.' },
    { key: 'practitionerAutoVerify' as const, label: 'Auto-verify providers', desc: 'Approve practitioner accounts automatically after registration.' },
    { key: 'crisisBannerEnabled' as const, label: 'Crisis support banner', desc: 'Show crisis support guidance in safety-sensitive areas.' },
    { key: 'maintenanceMode' as const, label: 'Maintenance mode', desc: 'Prepare the platform for controlled downtime.' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="mt-1 text-muted-foreground">CMS-level controls for global platform behavior and public identity</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Brand and Support Identity</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Platform name</span>
                <input className="input-field" value={settings.platformName} onChange={(e) => setSettings((current) => ({ ...current, platformName: e.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Support email</span>
                <input className="input-field" type="email" value={settings.supportEmail} onChange={(e) => setSettings((current) => ({ ...current, supportEmail: e.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Default session duration</span>
                <input className="input-field" type="number" min={15} value={settings.defaultSessionDuration} onChange={(e) => setSettings((current) => ({ ...current, defaultSessionDuration: Number(e.target.value) }))} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Supported languages</span>
                <input className="input-field" value={languageText} onChange={(e) => setLanguageText(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold">Operational Controls</h2>
            <div className="mt-5 divide-y divide-border">
              {toggles.map((toggle) => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => setBoolean(toggle.key)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span>
                    <span className="block font-medium">{toggle.label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{toggle.desc}</span>
                  </span>
                  <span className={`relative h-7 w-12 rounded-full transition ${settings[toggle.key] ? 'bg-brand-600' : 'bg-muted-foreground/30'}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${settings[toggle.key] ? 'left-6' : 'left-1'}`} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Live Config</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span className="font-medium">{settings.platformName}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Registrations</span><span className="font-medium">{settings.registrationsOpen ? 'Open' : 'Closed'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Maintenance</span><span className="font-medium">{settings.maintenanceMode ? 'Enabled' : 'Disabled'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Languages</span><span className="text-right font-medium">{languageText}</span></div>
          </div>
          <button className="btn-primary mt-6 w-full" disabled={saving} onClick={saveSettings}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            These controls are exposed through the Nest admin API, so the admin dashboard has a central place to evolve into production-grade tenant and feature-flag governance.
          </p>
        </aside>
      </div>
    </div>
  )
}
