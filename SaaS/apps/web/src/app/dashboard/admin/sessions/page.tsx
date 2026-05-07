'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Person {
  _id: string
  name: string
  email: string
  role: string
}

interface Session {
  _id: string
  clientId: Person
  practitionerId: Person
  scheduledAt: string
  duration: number
  type: string
  status: string
  meetingLink?: string
}

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'completed', 'cancelled']

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filters, setFilters] = useState({ status: '', type: '', search: '' })
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  const fetchSessions = () => {
    setLoading(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
    fetch(`/api/admin/sessions?${params}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(fetchSessions, 350)
    return () => clearTimeout(timer)
  }, [filters])

  const updateSession = async (id: string, body: Record<string, unknown>) => {
    setActioning(id)
    const res = await fetch(`/api/admin/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success('Session updated')
      fetchSessions()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to update session')
    }
    setActioning(null)
  }

  const setMeetingLink = (session: Session) => {
    const meetingLink = prompt('Meeting link', session.meetingLink || '')
    if (meetingLink === null) return
    updateSession(session._id, { meetingLink })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Session Operations</h1>
        <p className="mt-1 text-muted-foreground">Control every booking, status, and meeting link across the platform</p>
      </div>

      <div className="card grid gap-3 bg-muted/30 p-4 md:grid-cols-[1fr_180px_160px]">
        <input
          className="input-field"
          placeholder="Search client or practitioner..."
          value={filters.search}
          onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        />
        <select className="input-field" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select className="input-field" value={filters.type} onChange={(e) => setFilters((current) => ({ ...current, type: e.target.value }))}>
          <option value="">All types</option>
          <option value="online">Online</option>
          <option value="physical">Physical</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Appointment</th>
                <th className="px-5 py-4 font-medium">Client</th>
                <th className="px-5 py-4 font-medium">Provider</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading sessions...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No sessions found.</td></tr>
              ) : sessions.map((session) => (
                <tr key={session._id} className="align-top hover:bg-muted/10">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}</p>
                    <p className="text-xs capitalize text-muted-foreground">{session.type} · {session.duration} min</p>
                    {session.meetingLink && <p className="mt-1 max-w-xs truncate text-xs text-brand-600">{session.meetingLink}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{session.clientId?.name || 'Unknown client'}</p>
                    <p className="text-xs text-muted-foreground">{session.clientId?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{session.practitionerId?.name || 'Unknown provider'}</p>
                    <p className="text-xs capitalize text-muted-foreground">{session.practitionerId?.role}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge capitalize ${session.status === 'cancelled' ? 'badge-red' : session.status === 'completed' ? 'badge-green' : session.status === 'confirmed' ? 'badge-blue' : 'badge-yellow'}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="space-x-2 px-5 py-4 text-right">
                    <button className="btn-secondary h-auto px-2.5 py-1.5 text-xs" disabled={actioning === session._id} onClick={() => updateSession(session._id, { status: 'confirmed' })}>Confirm</button>
                    <button className="btn-secondary h-auto px-2.5 py-1.5 text-xs" disabled={actioning === session._id} onClick={() => updateSession(session._id, { status: 'completed' })}>Complete</button>
                    <button className="btn-secondary h-auto px-2.5 py-1.5 text-xs" disabled={actioning === session._id} onClick={() => setMeetingLink(session)}>Link</button>
                    <button className="btn-ghost h-auto px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10" disabled={actioning === session._id} onClick={() => updateSession(session._id, { status: 'cancelled' })}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
