'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className={`${size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'} rounded-lg bg-muted animate-pulse`} />

  const isDark = resolvedTheme === 'dark'

  const handleToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)

    // Persist to DB if logged in
    if (session?.user?.id) {
      try {
        await fetch(`/api/users/${session.user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme }),
        })
      } catch {
        // Non-critical — theme is already applied in UI
      }
    }
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'

  return (
    <button
      onClick={handleToggle}
      className={`${btnSize} inline-flex items-center justify-center rounded-lg border border-border bg-background transition-all hover:bg-accent hover:text-accent-foreground ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
