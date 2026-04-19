'use client'

import { useState, useEffect } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

interface Session {
  _id: string
  practitionerId: { _id: string; name: string; role: string; slmcRegNo?: string }
  scheduledAt: string
  duration: number
  type: string
  status: string
  meetingLink?: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    confirmed: 'badge-green',
    completed: 'badge-blue',
    cancelled: 'bg-destructive/10 text-destructive text-xs font-medium px-2.5 py-0.5 rounded-full',
  }
  return <span className={`badge ${map[status] ?? 'badge-yellow'} capitalize`}>{status}</span>
}

function VideoIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

export default function ClientOnlineSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => {
        // Only show online sessions
        setSessions(data.filter(s => s.type === 'online'))
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load sessions'); setLoading(false) })
  }, [])

  // Tick clock every 30 s so the join-button logic stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const upcoming = sessions.filter(s =>
    ['pending', 'confirmed'].includes(s.status) && new Date(s.scheduledAt) > now
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const past = sessions.filter(s =>
    s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduledAt) <= now
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const canJoin = (s: Session) => {
    if (!s.meetingLink || s.status !== 'confirmed') return false
    const minsUntil = differenceInMinutes(new Date(s.scheduledAt), now)
    return minsUntil <= 15 && minsUntil > -s.duration
  }

  const displayed = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <VideoIcon />
          </span>
          Online Sessions
        </h1>
        <p className="text-muted-foreground mt-1">
          Join your video sessions with your practitioner
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-background dark:from-brand-900/20 dark:border-brand-800 p-4 flex gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div>
          <p className="font-medium text-sm">How it works</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            The <strong>Join</strong> button becomes active <strong>15 minutes before</strong> your session starts.
            Your practitioner will set up the Google Meet link when they confirm your appointment.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} {t === 'upcoming' ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {/* Session cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎥</p>
          <p className="font-medium">
            {tab === 'upcoming' ? 'No upcoming online sessions' : 'No past online sessions'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {tab === 'upcoming' ? 'Book an online session with a practitioner to get started.' : ''}
          </p>
          {tab === 'upcoming' && (
            <Link href="/dashboard/client/schedule" className="btn-primary inline-flex">
              Book a Session
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(s => {
            const sessionDate = new Date(s.scheduledAt)
            const minsUntil = differenceInMinutes(sessionDate, now)
            const joinable = canJoin(s)
            const isImminent = minsUntil >= 0 && minsUntil <= 15

            return (
              <div
                key={s._id}
                className={`card p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition-all ${
                  isImminent ? 'border-brand-400 shadow-md dark:border-brand-600' : ''
                }`}
              >
                {/* Left: icon + time */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    isImminent ? 'bg-brand-100 dark:bg-brand-900/30 animate-pulse' : 'bg-muted'
                  }`}>
                    🎥
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {s.practitionerId?.name ?? 'Practitioner'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {s.practitionerId?.role}
                      {s.practitionerId?.slmcRegNo && ` · SLMC ${s.practitionerId.slmcRegNo}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(sessionDate, 'EEEE, d MMMM yyyy')}
                      {' · '}
                      <span className="font-medium text-foreground">{format(sessionDate, 'h:mm a')}</span>
                      {' · '}
                      {s.duration} min
                    </p>
                    {isImminent && (
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
                        Starting in {minsUntil} minute{minsUntil !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: status + action */}
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={s.status} />

                  {joinable ? (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`join-session-${s._id}`}
                      className="btn-primary flex items-center gap-2"
                    >
                      <VideoIcon />
                      Join Now
                    </a>
                  ) : s.status === 'confirmed' && !s.meetingLink ? (
                    <span className="text-xs text-muted-foreground italic">
                      Awaiting meeting link
                    </span>
                  ) : s.status === 'pending' ? (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      Awaiting confirmation
                    </span>
                  ) : s.status === 'confirmed' && minsUntil > 15 ? (
                    <span className="text-xs text-muted-foreground">
                      Opens {minsUntil > 60
                        ? `in ${Math.round(minsUntil / 60)}h`
                        : `in ${minsUntil}min`}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
