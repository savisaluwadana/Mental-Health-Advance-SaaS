'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Person {
  _id: string
  name: string
  email: string
}

interface AlertMessage {
  _id: string
  content: string
  flagReasons?: string[]
  createdAt: string
}

interface SafetyAlert {
  _id: string
  clientId: Person
  practitionerId: Person
  messageId: AlertMessage
  reasons: string[]
  status: string
  createdAt: string
}

const STATUSES = ['', 'pending', 'acknowledged', 'escalated']

export default function AdminSafetyPage() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([])
  const [filters, setFilters] = useState({ status: 'pending', search: '' })
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  const counts = useMemo(() => ({
    pending: alerts.filter((alert) => alert.status === 'pending').length,
    acknowledged: alerts.filter((alert) => alert.status === 'acknowledged').length,
    escalated: alerts.filter((alert) => alert.status === 'escalated').length,
  }), [alerts])

  const fetchAlerts = () => {
    setLoading(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
    fetch(`/api/admin/safety-alerts?${params}`)
      .then((res) => res.json())
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(fetchAlerts, 350)
    return () => clearTimeout(timer)
  }, [filters])

  const updateAlert = async (id: string, status: string) => {
    setActioning(id)
    const res = await fetch(`/api/admin/safety-alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(`Alert marked ${status}`)
      fetchAlerts()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to update alert')
    }
    setActioning(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Center</h1>
          <p className="mt-1 text-muted-foreground">Review flagged conversations and control emergency triage workflows</p>
        </div>
        <Link href="/dashboard/admin/keywords" className="btn-secondary">Manage Keywords</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="mt-2 text-3xl font-bold text-yellow-600">{counts.pending}</p></div>
        <div className="card p-5"><p className="text-sm text-muted-foreground">Acknowledged</p><p className="mt-2 text-3xl font-bold text-blue-600">{counts.acknowledged}</p></div>
        <div className="card p-5"><p className="text-sm text-muted-foreground">Escalated</p><p className="mt-2 text-3xl font-bold text-red-600">{counts.escalated}</p></div>
      </div>

      <div className="card grid gap-3 bg-muted/30 p-4 md:grid-cols-[1fr_180px]">
        <input
          className="input-field"
          placeholder="Search client, provider, or message text..."
          value={filters.search}
          onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        />
        <select className="input-field" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="card h-40 animate-pulse p-6" />
        ) : alerts.length === 0 ? (
          <div className="card p-8 text-center text-muted-foreground">No safety alerts match this view.</div>
        ) : alerts.map((alert) => (
          <div key={alert._id} className="card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge capitalize ${alert.status === 'escalated' ? 'badge-red' : alert.status === 'acknowledged' ? 'badge-blue' : 'badge-yellow'}`}>{alert.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                  {alert.reasons?.map((reason) => <span key={reason} className="badge badge-red text-[10px]">{reason}</span>)}
                </div>
                <blockquote className="rounded-2xl border border-red-200 bg-red-50/60 p-4 text-sm leading-6 text-red-950 dark:border-red-900 dark:bg-red-950/20 dark:text-red-100">
                  {alert.messageId?.content || 'Message content unavailable'}
                </blockquote>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
                    <p className="font-semibold">{alert.clientId?.name || 'Unknown client'}</p>
                    <p className="text-xs text-muted-foreground">{alert.clientId?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned Practitioner</p>
                    <p className="font-semibold">{alert.practitionerId?.name || 'Unknown practitioner'}</p>
                    <p className="text-xs text-muted-foreground">{alert.practitionerId?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button className="btn-secondary h-auto px-3 py-2 text-xs" disabled={actioning === alert._id} onClick={() => updateAlert(alert._id, 'acknowledged')}>Acknowledge</button>
                <button className="btn-primary h-auto px-3 py-2 text-xs" disabled={actioning === alert._id} onClick={() => updateAlert(alert._id, 'escalated')}>Escalate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
