'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './GoogleTranslate'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
    </svg>
  )
}

export function DashboardSidebar({ role }: { role: 'client' | 'psychologist' | 'psychiatrist' | 'counsellor' | 'admin' }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const clientNav: NavItem[] = [
    { href: '/dashboard/client', label: 'Home', icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { href: '/dashboard/client/mood', label: 'Mood Tracker', icon: <NavIcon d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { href: '/dashboard/client/schedule', label: 'Book Session', icon: <NavIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { href: '/dashboard/client/sessions', label: 'Online Sessions', icon: <NavIcon d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
    { href: '/dashboard/client/goals', label: 'Goals', icon: <NavIcon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /> },
    { href: '/dashboard/client/progress', label: 'Progress', icon: <NavIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { href: '/dashboard/client/messages', label: 'Messages', icon: <NavIcon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
  ]

  const practitionerNav: NavItem[] = [
    { href: '/dashboard/practitioner', label: 'Overview', icon: <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { href: '/dashboard/practitioner/clients', label: 'My Clients', icon: <NavIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { href: '/dashboard/practitioner/schedule', label: 'Schedule', icon: <NavIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { href: '/dashboard/practitioner/sessions', label: 'Online Sessions', icon: <NavIcon d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
    { href: '/dashboard/practitioner/notes', label: 'Session Notes', icon: <NavIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { href: '/dashboard/practitioner/messages', label: 'Messages', icon: <NavIcon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
    ...(role === 'psychiatrist'
      ? [{ href: '/dashboard/practitioner/prescriptions', label: 'Prescriptions', icon: <NavIcon d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> }]
      : []),
  ]

  const adminNav: NavItem[] = [
    { href: '/dashboard/admin', label: 'Command Center', icon: <NavIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h4.75c.621 0 1.125.504 1.125 1.125v6.75C10 20.496 9.496 21 8.875 21h-4.75A1.125 1.125 0 013 19.875v-6.75zM14 4.125C14 3.504 14.504 3 15.125 3h4.75C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-4.75A1.125 1.125 0 0114 19.875V4.125zM3 4.125C3 3.504 3.504 3 4.125 3h4.75C9.496 3 10 3.504 10 4.125v3.75C10 8.496 9.496 9 8.875 9h-4.75A1.125 1.125 0 013 7.875v-3.75z" /> },
    { href: '/dashboard/admin/users', label: 'User Management', icon: <NavIcon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { href: '/dashboard/admin/providers', label: 'Provider CMS', icon: <NavIcon d="M9 12l2 2 4-4M12 3l7.794 4.5v9L12 21l-7.794-4.5v-9L12 3z" /> },
    { href: '/dashboard/admin/sessions', label: 'Session Ops', icon: <NavIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { href: '/dashboard/admin/safety', label: 'Safety Center', icon: <NavIcon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
    { href: '/dashboard/admin/keywords', label: 'Safety Keywords', icon: <NavIcon d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /> },
    { href: '/dashboard/admin/blog', label: 'Content CMS', icon: <NavIcon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
    { href: '/dashboard/admin/prescriptions', label: 'Prescriptions', icon: <NavIcon d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
    { href: '/dashboard/admin/settings', label: 'Platform Settings', icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  ]

  const navItems = role === 'admin' ? adminNav : role === 'client' ? clientNav : practitionerNav
  const basePath = role === 'admin' ? '/dashboard/admin' : role === 'client' ? '/dashboard/client' : '/dashboard/practitioner'

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-sm font-bold">SafeSpace<span className="text-brand-600"> SL</span></span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === basePath
            ? pathname === basePath
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )}
        )}
      </nav>

      {/* Bottom: user info + theme + sign out */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold dark:bg-brand-900/30 dark:text-brand-300">
            {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{session?.user?.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{session?.user?.role}</p>
          </div>
          <ThemeToggle size="sm" />
        </div>
        <LanguageSwitcher variant="sidebar" />
        <Link
          href="/"
          onClick={onNavigate}
          className="sidebar-link w-full text-muted-foreground hover:text-foreground"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Website
        </Link>
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            router.push('/login')
          }}
          className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Open menu"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold">SafeSpace<span className="text-brand-600"> SL</span></span>
        </div>
        <ThemeToggle size="sm" />
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold">SafeSpace<span className="text-brand-600"> SL</span></span>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-60 flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>
    </>
  )
}
