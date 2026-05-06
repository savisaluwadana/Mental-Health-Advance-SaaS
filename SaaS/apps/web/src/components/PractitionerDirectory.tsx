'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa']
const LANGUAGES = ['English', 'Sinhala', 'Tamil']

interface Practitioner {
  _id: string
  name: string
  role: string
  specialty?: string
  province?: string
  languages?: string[]
  sessionTypes?: string[]
  slmcRegNo?: string
  bio?: string
  avatar?: string
}

export function PractitionerDirectory() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ province: '', language: '', type: '', role: '', search: '' })

  const fetchPractitioners = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.province) params.set('province', filters.province)
    if (filters.language) params.set('language', filters.language)
    if (filters.type) params.set('type', filters.type)
    if (filters.role) params.set('role', filters.role)
    if (filters.search) params.set('search', filters.search)

    try {
      const res = await fetch(`/api/practitioners?${params}`)
      const data = await res.json()
      setPractitioners(Array.isArray(data) ? data : [])
    } catch {
      setPractitioners([])
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchPractitioners()
  }, [fetchPractitioners])

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }))

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <select
          className="w-full sm:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filters.province}
          onChange={(e) => setFilter('province', e.target.value)}
          id="filter-province"
        >
          <option value="">All Provinces</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          className="w-full sm:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filters.language}
          onChange={(e) => setFilter('language', e.target.value)}
          id="filter-language"
        >
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select
          className="w-full sm:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filters.type}
          onChange={(e) => setFilter('type', e.target.value)}
          id="filter-type"
        >
          <option value="">Online & In-Person</option>
          <option value="online">Online</option>
          <option value="physical">In-Person</option>
        </select>

        <select
          className="w-full sm:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={filters.role}
          onChange={(e) => setFilter('role', e.target.value)}
          id="filter-role"
        >
          <option value="">All Practitioners</option>
          <option value="psychologist">Psychologist</option>
          <option value="psychiatrist">Psychiatrist</option>
        </select>

        <input
          type="text"
          className="w-full sm:flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by name or specialty…"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          id="filter-search"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : practitioners.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </div>
          <p className="font-semibold text-lg">No practitioners found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your filters, or{' '}
            <button
              onClick={() => setFilters({ province: '', language: '', type: '', role: '', search: '' })}
              className="text-brand-600 hover:underline font-medium"
            >
              clear all filters
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            No practitioners are registered yet.{' '}
            <Link href="/register" className="text-brand-600 hover:underline">
              Register as a practitioner →
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practitioners.map((p) => (
            <div key={p._id}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all group">
              <div className="flex items-start gap-4 mb-4">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name}
                    className="h-14 w-14 rounded-full object-cover shrink-0 ring-2 ring-brand-100 dark:ring-brand-900/30" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xl font-bold">
                    {p.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate group-hover:text-brand-600 transition-colors">{p.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{p.role}</p>
                  {p.slmcRegNo && (
                    <p className="text-xs text-muted-foreground mt-0.5">SLMC: {p.slmcRegNo}</p>
                  )}
                </div>
              </div>

              {p.specialty && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">Specialty: {p.specialty}</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {p.languages?.map((l) => (
                  <span key={l}
                    className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
                    {l}
                  </span>
                ))}
                {p.province && (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-400">
                    {p.province}
                  </span>
                )}
                {p.sessionTypes?.map((t) => (
                  <span key={t}
                    className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:border-yellow-800/50 dark:bg-yellow-900/20 dark:text-yellow-400 capitalize">
                    {t === 'online' ? 'Online' : 'In-person'}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Link href="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                  Book a Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        {!loading && practitioners.length > 0 && (
          <span>{practitioners.length} practitioner{practitioners.length > 1 ? 's' : ''} found · </span>
        )}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          Sign up to book a session →
        </Link>
      </p>
    </div>
  )
}
