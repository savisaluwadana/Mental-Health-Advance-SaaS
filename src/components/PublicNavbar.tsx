'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ThemeToggle } from './ThemeToggle'
import { useState } from 'react'

export function PublicNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/#therapists', label: 'Find a Therapist' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/resources', label: 'Resources' },
    { href: '/docs', label: 'Documentation' },
    { href: '/#faq', label: 'FAQ' },
  ]

  const getDashboardHref = () => {
    const role = session?.user?.role
    if (role === 'client') return '/dashboard/client'
    if (role === 'psychologist' || role === 'psychiatrist') return '/dashboard/practitioner'
    if (role === 'admin') return '/dashboard/admin'
    return '/dashboard'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground">MindBridge<span className="text-brand-600"> SL</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            {session ? (
              <Link href={getDashboardHref()} className="btn-primary text-xs px-3 py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm px-3 py-2">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm px-3 py-2">Get Started</Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
