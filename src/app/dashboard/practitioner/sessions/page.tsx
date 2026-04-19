'use client'

import { useState, useEffect } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { toast } from 'sonner'

interface Session {
  _id: string
  clientId: { _id: string; name: string; email: string }
  scheduledAt: string
  duration: number
  type: string
  status: string
  meetingLink?: string
}

// ── Small reusable helpers ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    confirmed: 'badge-green',
    completed: 'badge-blue',
    cancelled: 'bg-destructive/10 text-destructive text-xs font-medium px-2.5 py-0.5 rounded-full',
  }
  return <span className={`badge ${map[status] ?? 'badge-yellow'} capitalize`}>{status}</span>
}

function VideoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function GMeetLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 shrink-0" fill="none">
      <path d="M29 24.337l10.5-8.087V31.75L29 23.663v.674z" fill="#00832D"/>
      <path d="M4 31.75V16.25C4 14.455 5.455 13 7.25 13H26.5v35H7.25C5.455 48 4 46.545 4 44.75V31.75z" fill="#0066DA"/>
      <path d="M26.5 13h8l5.5 4.25v18L26.5 48V13z" fill="#E94235"/>
      <path d="M34.5 13l5 4.25V31.5L26.5 38.5V30l8-5V13z" fill="#2684FC"/>
      <path d="M4 32h22.5v8H4z" fill="#00AC47"/>
      <path d="M26.5 21H4v11h22.5V21z" fill="#00832D"/>
      <path d="M26.5 13H4v8h22.5V13z" fill="#0066DA"/>
    </svg>
  )
}

function TeamsLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 shrink-0" fill="none">
      <circle cx="34" cy="14" r="7" fill="#7B83EB"/>
      <circle cx="34" cy="14" r="5" fill="#fff" opacity=".2"/>
      <path d="M41 22h-14a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V24a2 2 0 00-2-2z" fill="#7B83EB"/>
      <path d="M27 22h14v5H27z" fill="#fff" opacity=".1"/>
      <rect x="6" y="20" width="26" height="22" rx="4" fill="#5059C9"/>
      <circle cx="19" cy="13" r="8" fill="#5059C9"/>
      <circle cx="19" cy="13" r="5" fill="#fff"/>
    </svg>
  )
}

// ── README / How-to panel ─────────────────────────────────────────────────────

function ReadmePanel() {
  const [open, setOpen] = useState(true)

  const steps = [
    'A client books an online session — it appears below as <strong>Pending</strong>.',
    'Click <strong>Accept</strong> to confirm the session.',
    'Click <strong>Set Meeting Link</strong> on the confirmed session card.',
    'Choose your platform (Google Meet or Teams) — it opens in a new tab.',
    'Create a new meeting there, <strong>copy the join link</strong>, then return to this page.',
    'Paste the link and click <strong>Save &amp; Notify Client</strong>.',
    'The client immediately sees a <strong>Join</strong> button — active 15 min before the session.',
    'After the session ends, click <strong>Mark Completed</strong>.',
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-lg">
            📖
          </span>
          <div className="text-left">
            <p className="font-semibold text-sm">How to set up a video session</p>
            <p className="text-xs text-muted-foreground">Step-by-step guide · Google Meet &amp; Microsoft Teams</p>
          </div>
        </div>
        <svg className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5 space-y-6 text-sm">

          {/* Overview */}
          <div>
            <h2 className="font-bold text-base mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">i</span>
              Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              MindBridge SL uses external platforms for video calls. You create the meeting on{' '}
              <strong>Google Meet</strong> or <strong>Microsoft Teams</strong>, copy the join link,
              and paste it here. Your client will immediately see a <strong>Join</strong> button on
              their dashboard — they need no account on the platform.
            </p>
          </div>

          {/* Complete workflow */}
          <div>
            <h2 className="font-bold text-base mb-3">📋 Complete Workflow</h2>
            <ol className="space-y-2.5">
              {steps.map((text, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: text }} />
                </li>
              ))}
            </ol>
          </div>

          {/* Platform-specific guides side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Google Meet */}
            <div className="rounded-xl border-2 border-[#1A73E8]/30 bg-blue-50/50 dark:bg-blue-950/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GMeetLogo />
                <h3 className="font-bold text-[#1A73E8]">Google Meet</h3>
              </div>
              <ol className="space-y-2 text-muted-foreground">
                {[
                  <>Click the <strong>Google Meet</strong> card — opens <code className="text-xs bg-muted px-1 py-0.5 rounded">meet.google.com/landing</code>.</>,
                  <>Sign in with your Google account if prompted.</>,
                  <>Click <strong>&ldquo;New meeting&rdquo;</strong> → <strong>&ldquo;Start an instant meeting&rdquo;</strong>.</>,
                  <>Copy the link from the address bar or the <strong>&ldquo;Copy joining info&rdquo;</strong> button.</>,
                  <>Return here and paste the link into the input field.</>,
                ].map((text, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-[#1A73E8] shrink-0">{i + 1}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground italic">
                💡 Clients can join as a guest — no Google account needed.
              </p>
            </div>

            {/* Microsoft Teams */}
            <div className="rounded-xl border-2 border-[#6264A7]/30 bg-purple-50/50 dark:bg-purple-950/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TeamsLogo />
                <h3 className="font-bold text-[#6264A7]">Microsoft Teams</h3>
              </div>
              <ol className="space-y-2 text-muted-foreground">
                {[
                  <>Click the <strong>Microsoft Teams</strong> card — opens <code className="text-xs bg-muted px-1 py-0.5 rounded">teams.microsoft.com</code>.</>,
                  <>Sign in with your Microsoft / Office 365 account.</>,
                  <>Go to <strong>Calendar</strong> → <strong>&ldquo;New meeting&rdquo;</strong> (top right).</>,
                  <>Fill in details and click <strong>Save</strong>. Open the meeting and copy the <strong>Join link</strong>.</>,
                  <>Return here and paste the link into the input field.</>,
                ].map((text, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-[#6264A7] shrink-0">{i + 1}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground italic">
                💡 Clients can join via browser — no Teams app required.
              </p>
            </div>
          </div>

          {/* Client experience note */}
          <div className="rounded-xl border border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/30 p-4 flex gap-3">
            <span className="text-xl shrink-0">👤</span>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">What your client sees</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                Once you save the link, your client&apos;s dashboard shows a <strong>Join Now</strong> button
                on their session card — active <strong>15 minutes before</strong> the session starts
                and deactivated after the session duration ends. One click to join, no signup needed.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PractitionerOnlineSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [now, setNow] = useState(new Date())
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [actioning, setActioning] = useState<string | null>(null)

  const fetchSessions = () =>
    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => {
        setSessions(data.filter(s => s.type === 'online'))
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load sessions'); setLoading(false) })

  useEffect(() => { fetchSessions() }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const upcoming = sessions
    .filter(s => ['pending', 'confirmed'].includes(s.status) && new Date(s.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const past = sessions
    .filter(s => s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduledAt) <= now)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const displayed = tab === 'upcoming' ? upcoming : past

  const canJoin = (s: Session) => {
    if (!s.meetingLink || s.status !== 'confirmed') return false
    const minsUntil = differenceInMinutes(new Date(s.scheduledAt), now)
    return minsUntil <= 15 && minsUntil > -s.duration
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    setActioning(id)
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success(`Session marked as ${status}`); fetchSessions() }
    else toast.error('Failed to update session')
    setActioning(null)
  }

  const handleSaveMeetingLink = async (id: string, link: string) => {
    if (!link.startsWith('http')) { toast.error('Please enter a valid URL'); return }
    setSaving(id)
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingLink: link }),
    })
    if (res.ok) {
      toast.success('Meeting link saved — client can now join')
      setEditingLink(null)
      setLinkInput('')
      fetchSessions()
    } else {
      toast.error('Failed to save meeting link')
    }
    setSaving(null)
  }

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
        <p className="text-muted-foreground mt-1">Manage your video consultations with clients</p>
      </div>

      {/* README panel */}
      <ReadmePanel />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {/* Session list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-32 animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎥</p>
          <p className="font-medium">{tab === 'upcoming' ? 'No upcoming online sessions' : 'No past online sessions'}</p>
          <p className="text-sm text-muted-foreground mt-1">Online sessions booked by clients will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayed.map(s => {
            const sessionDate = new Date(s.scheduledAt)
            const minsUntil = differenceInMinutes(sessionDate, now)
            const isImminent = minsUntil >= 0 && minsUntil <= 15 && s.status === 'confirmed'
            const joinable = canJoin(s)
            const isEditing = editingLink === s._id

            return (
              <div key={s._id}
                className={`card p-5 space-y-4 transition-all ${isImminent ? 'border-brand-400 shadow-md dark:border-brand-600' : ''}`}>

                {/* Top row: client info + actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold bg-muted ${
                      isImminent ? 'ring-2 ring-brand-400 dark:ring-brand-600' : ''}`}>
                      {s.clientId?.name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.clientId?.name ?? 'Client'}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.clientId?.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(sessionDate, 'EEEE, d MMMM yyyy')}
                        {' · '}
                        <span className="font-medium text-foreground">{format(sessionDate, 'h:mm a')}</span>
                        {' · '}{s.duration} min
                      </p>
                      {isImminent && (
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1 flex items-center gap-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
                          Starting in {minsUntil} minute{minsUntil !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges + quick actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <StatusBadge status={s.status} />

                    {s.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(s._id, 'confirmed')}
                          disabled={actioning === s._id}
                          className="btn-primary text-xs px-3 py-1.5"
                          id={`accept-session-${s._id}`}>
                          Accept
                        </button>
                        <button onClick={() => handleUpdateStatus(s._id, 'cancelled')}
                          disabled={actioning === s._id}
                          className="btn-ghost text-xs px-3 py-1.5 text-destructive hover:bg-destructive/10">
                          Decline
                        </button>
                      </>
                    )}

                    {s.status === 'confirmed' && (
                      <>
                        {joinable && (
                          <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                            id={`start-session-${s._id}`}
                            className="btn-primary flex items-center gap-2">
                            <VideoIcon className="h-4 w-4" />
                            Start Session
                          </a>
                        )}
                        <button onClick={() => handleUpdateStatus(s._id, 'completed')}
                          disabled={actioning === s._id}
                          className="btn-secondary text-xs px-3 py-1.5">
                          Mark Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Meeting link panel (pending / confirmed only) */}
                {['pending', 'confirmed'].includes(s.status) && (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">

                    {/* Current link + toggle button */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Meeting Link</p>
                        {s.meetingLink ? (
                          <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-brand-600 dark:text-brand-400 hover:underline truncate block">
                            {s.meetingLink}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No meeting link set yet — client cannot join</p>
                        )}
                      </div>
                      <button
                        onClick={() => { setEditingLink(isEditing ? null : s._id); setLinkInput(s.meetingLink ?? '') }}
                        className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                        id={`set-link-${s._id}`}>
                        {isEditing ? 'Cancel' : s.meetingLink ? 'Change Link' : 'Set Meeting Link'}
                      </button>
                    </div>

                    {/* Expanded: provider picker + paste input */}
                    {isEditing && (
                      <div className="space-y-4 pt-2 border-t border-border">

                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Step 1 — Open your preferred platform to create a meeting
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Google Meet */}
                          <a href="https://meet.google.com/landing" target="_blank" rel="noopener noreferrer"
                            id={`open-gmeet-${s._id}`}
                            className="flex items-center gap-3 rounded-xl border-2 border-border bg-card hover:border-[#1A73E8] hover:shadow-md transition-all p-3 group">
                            <GMeetLogo />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm group-hover:text-[#1A73E8] transition-colors">Google Meet</p>
                              <p className="text-xs text-muted-foreground">Opens meet.google.com/landing →</p>
                            </div>
                          </a>

                          {/* Microsoft Teams */}
                          <a href="https://teams.microsoft.com/" target="_blank" rel="noopener noreferrer"
                            id={`open-teams-${s._id}`}
                            className="flex items-center gap-3 rounded-xl border-2 border-border bg-card hover:border-[#6264A7] hover:shadow-md transition-all p-3 group">
                            <TeamsLogo />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm group-hover:text-[#6264A7] transition-colors">Microsoft Teams</p>
                              <p className="text-xs text-muted-foreground">Opens teams.microsoft.com →</p>
                            </div>
                          </a>
                        </div>

                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Step 2 — Copy the meeting link from that platform and paste it here
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            className="input-field flex-1 text-sm"
                            placeholder="https://meet.google.com/xxx-xxxx-xxx  or  https://teams.microsoft.com/…"
                            value={linkInput}
                            onChange={e => setLinkInput(e.target.value)}
                            id={`link-input-${s._id}`}
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveMeetingLink(s._id, linkInput)}
                            disabled={saving === s._id || !linkInput}
                            className="btn-primary text-sm px-4 disabled:opacity-50"
                            id={`save-link-${s._id}`}>
                            {saving === s._id ? 'Saving…' : 'Save & Notify Client'}
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Once saved, your client will immediately see a <strong>Join</strong> button on their dashboard.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Completed session — show link used */}
                {s.status === 'completed' && s.meetingLink && (
                  <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Session held at:</span>
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline truncate">
                      {s.meetingLink}
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
