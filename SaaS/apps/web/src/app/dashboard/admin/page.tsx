'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface AdminStats {
  users: number
  clients: number
  practitioners: number
  admins: number
  pendingPractitioners: number
  sessions: number
  pendingSessions: number
  confirmedSessions: number
  completedSessions: number
  cancelledSessions: number
  pendingSafetyAlerts: number
  escalatedSafetyAlerts: number
  prescriptions: number
  articles: number
  keywords: number
}

const EMPTY_STATS: AdminStats = {
  users: 0,
  clients: 0,
  practitioners: 0,
  admins: 0,
  pendingPractitioners: 0,
  sessions: 0,
  pendingSessions: 0,
  confirmedSessions: 0,
  completedSessions: 0,
  cancelledSessions: 0,
  pendingSafetyAlerts: 0,
  escalatedSafetyAlerts: 0,
  prescriptions: 0,
  articles: 0,
  keywords: 0,
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats({ ...EMPTY_STATS, ...data }))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.users, detail: `${stats.clients} clients, ${stats.practitioners} providers`, tone: 'brand' },
    { label: 'Pending Provider Reviews', value: stats.pendingPractitioners, detail: 'Verification queue', tone: 'yellow' },
    { label: 'Open Safety Alerts', value: stats.pendingSafetyAlerts, detail: `${stats.escalatedSafetyAlerts} escalated`, tone: 'red' },
    { label: 'Sessions Managed', value: stats.sessions, detail: `${stats.pendingSessions} pending, ${stats.confirmedSessions} confirmed`, tone: 'blue' },
    { label: 'Published Articles', value: stats.articles, detail: 'CMS library', tone: 'green' },
    { label: 'Prescriptions', value: stats.prescriptions, detail: 'Clinical documents', tone: 'slate' },
  ]

  const ops = [
    { href: '/dashboard/admin/providers', title: 'Provider Control', desc: 'Approve practitioners, create provider accounts, and review licensing metadata.' },
    { href: '/dashboard/admin/sessions', title: 'Session Operations', desc: 'Confirm, cancel, complete, and attach meeting links for all appointments.' },
    { href: '/dashboard/admin/safety', title: 'Safety Center', desc: 'Triage flagged messages, acknowledge cases, and escalate urgent risks.' },
    { href: '/dashboard/admin/blog', title: 'Content CMS', desc: 'Create, edit, and delete articles that power the public resource library.' },
    { href: '/dashboard/admin/prescriptions', title: 'Prescription Registry', desc: 'Audit prescriptions, medications, expiry dates, and generated PDFs.' },
    { href: '/dashboard/admin/settings', title: 'Platform Settings', desc: 'Control registrations, maintenance mode, crisis banner, languages, and support identity.' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 via-card to-blue-50 p-8 dark:border-brand-900 dark:from-brand-950/30 dark:via-card dark:to-blue-950/20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">Admin Command Center</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Complete platform control for SafeSpace Lanka</h1>
          <p className="mt-3 text-muted-foreground">
            Manage users, care providers, clinical operations, safety workflows, content, prescriptions, and global platform settings from one CMS-style console.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card h-32 animate-pulse p-6" />) : statCards.map((card) => (
          <div key={card.label} className="card p-6">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-4xl font-bold">{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {ops.map((item) => (
          <Link key={item.href} href={item.href} className="card group p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/30 dark:text-brand-200">
                Open
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
