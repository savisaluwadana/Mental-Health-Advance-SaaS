'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Session { _id: string; clientId: { name: string }; scheduledAt: string; status: string; type: string; meetingLink?: string }

export default function PractitionerSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  const fetchSessions = () => fetch('/api/sessions').then(r => r.json()).then(data => { setSessions(data); setLoading(false) })

  useEffect(() => { fetchSessions() }, [])

  const updateStatus = async (id: string, status: string) => {
    setActioning(id)
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      toast.success(`Session ${status}`)
      fetchSessions()
    } else {
      toast.error('Failed to update session')
    }
    setActioning(null)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming appointments</p>
      </div>

      <div className="space-y-4">
        {loading ? <p className="animate-pulse">Loading...</p> : 
         sessions.filter(s => s.status !== 'cancelled').length === 0 ? <p className="text-muted-foreground">No sessions scheduled.</p> :
         sessions.filter(s => s.status !== 'cancelled').map(s => (
          <div key={s._id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{s.clientId?.name || 'Client'}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(s.scheduledAt), 'EEEE, d MMMM yyyy • h:mm a')} · {s.type}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`badge ${s.status === 'confirmed' ? 'badge-green' : s.status === 'completed' ? 'badge-blue' : 'badge-yellow'}`}>{s.status}</span>
              {s.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(s._id, 'confirmed')} disabled={actioning === s._id} className="btn-primary text-xs px-3 py-1.5">Accept</button>
                  <button onClick={() => updateStatus(s._id, 'cancelled')} disabled={actioning === s._id} className="btn-ghost text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5">Reject</button>
                </>
              )}
              {s.status === 'confirmed' && (
                 <button onClick={() => updateStatus(s._id, 'completed')} disabled={actioning === s._id} className="btn-primary text-xs px-3 py-1.5">Mark Completed</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
