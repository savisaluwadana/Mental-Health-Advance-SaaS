'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'

interface Practitioner { _id: string; name: string; specialty?: string; province?: string; languages: string[]; sessionTypes?: string[]; role: string; slmcRegNo?: string; avatar?: string }

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa']
const LANGUAGES = ['English', 'Sinhala', 'Tamil']

export default function SchedulePage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [filters, setFilters] = useState({ province: '', language: '', type: '', role: '' })
  const [selected, setSelected] = useState<Practitioner | null>(null)
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('09:00')
  const [sessionType, setSessionType] = useState<'online' | 'physical'>('online')
  const [booking, setBooking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mySessions, setMySessions] = useState<any[]>([])

  useEffect(() => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)))
    Promise.all([
      fetch(`/api/practitioners?${params}`).then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
    ]).then(([practs, sessions]) => {
      setPractitioners(practs)
      setMySessions(sessions)
      setLoading(false)
    })
  }, [filters])

  const handleBook = async () => {
    if (!selected || !slotDate) { toast.error('Please select a practitioner and date'); return }
    setBooking(true)
    const scheduledAt = new Date(`${slotDate}T${slotTime}:00`)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ practitionerId: selected._id, scheduledAt, type: sessionType }),
    })
    if (res.ok) {
      toast.success('Session booked! Awaiting practitioner confirmation.')
      setSelected(null)
      setSlotDate('')
      const updated = await fetch('/api/sessions').then((r) => r.json())
      setMySessions(updated)
    } else {
      const err = await res.json()
      toast.error(err.error || 'Booking failed')
    }
    setBooking(false)
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this session?')) return
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (res.ok) {
      toast.success('Session cancelled')
      setMySessions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'cancelled' } : s))
    } else {
      const err = await res.json(); toast.error(err.error || 'Cancellation failed')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Book a Session</h1>
        <p className="text-muted-foreground mt-1">Find a practitioner and schedule your appointment</p>
      </div>

      {/* Upcoming sessions */}
      {mySessions.filter((s) => ['pending', 'confirmed'].includes(s.status) && new Date(s.scheduledAt) > new Date()).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Upcoming Sessions</h2>
          <div className="space-y-3">
            {mySessions.filter((s) => ['pending', 'confirmed'].includes(s.status) && new Date(s.scheduledAt) > new Date()).map((s) => {
              const hoursUntil = (new Date(s.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60)
              return (
                <div key={s._id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{s.practitionerId?.name ?? 'Practitioner'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(s.scheduledAt), 'EEE, d MMM yyyy • h:mm a')} · {s.type}
                    </p>
                  </div>
                  <span className={`badge ${s.status === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}>{s.status}</span>
                  {s.meetingLink && s.status === 'confirmed' && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-1.5">Join</a>
                  )}
                  {hoursUntil > 24 && (
                    <button onClick={() => handleCancel(s._id)} className="btn-ghost text-xs px-3 py-1.5 text-destructive hover:bg-destructive/10">Cancel</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        {['province', 'language', 'type', 'role'].map((key) => (
          <select key={key} className="input-field max-w-[160px] capitalize"
            value={(filters as any)[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
            <option value="">All {key}s</option>
            {key === 'province' && PROVINCES.map((p) => <option key={p}>{p}</option>)}
            {key === 'language' && LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            {key === 'type' && ['online', 'physical'].map((t) => <option key={t} value={t}>{t}</option>)}
            {key === 'role' && ['psychologist', 'psychiatrist'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        ))}
      </div>

      {/* Practitioner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-36" />) :
          practitioners.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-16">No practitioners found with these filters</p>
          ) : practitioners.map((p) => (
            <div key={p._id} className={`card p-5 cursor-pointer transition-all hover:shadow-md ${selected?._id === p._id ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => setSelected(selected?._id === p._id ? null : p)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-lg font-bold dark:bg-brand-900/30 dark:text-brand-300">
                  {p.name[0]}
                </div>
                <div className="min-w-0flex-1">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                  {p.slmcRegNo && <p className="text-xs text-muted-foreground">SLMC: {p.slmcRegNo}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.languages?.map((l) => <span key={l} className="badge badge-green">{l}</span>)}
                {p.province && <span className="badge badge-blue">{p.province}</span>}
                {p.sessionTypes?.map((t) => <span key={t} className="badge badge-yellow capitalize">{t}</span>)}
              </div>
              {p.specialty && <p className="text-xs text-muted-foreground mt-2 truncate">🎯 {p.specialty}</p>}
            </div>
          ))}
      </div>

      {/* Booking form */}
      {selected && (
        <div className="card p-6 border-brand-200 dark:border-brand-800">
          <h2 className="font-semibold text-lg mb-4">Book with {selected.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label block mb-1.5">Date</label>
              <input type="date" className="input-field w-full" min={new Date().toISOString().split('T')[0]}
                value={slotDate} onChange={(e) => setSlotDate(e.target.value)} id="booking-date" />
            </div>
            <div>
              <label className="label block mb-1.5">Time</label>
              <input type="time" className="input-field w-full" value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)} id="booking-time" />
            </div>
            <div>
              <label className="label block mb-1.5">Session Type</label>
              <select className="input-field w-full" value={sessionType} onChange={(e) => setSessionType(e.target.value as any)}>
                {(selected.sessionTypes || ['online', 'physical']).map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleBook} disabled={booking} className="btn-primary" id="booking-submit">
              {booking ? 'Booking…' : 'Confirm Booking'}
            </button>
            <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ℹ️ Your session will be confirmed by the practitioner. You can cancel up to 24 hours before.
          </p>
        </div>
      )}
    </div>
  )
}
