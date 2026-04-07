'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Session { _id: string; clientId: { _id: string; name: string }; scheduledAt: string; status: string; duration: number }
interface Note { _id: string; content: string; createdAt: string }

export default function SessionNotesPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions').then((r) => r.json()).then((data) => {
      setSessions(data.filter((s: any) => s.status !== 'cancelled'))
      setLoading(false)
    })
  }, [])

  const loadNotes = async (session: Session) => {
    setSelectedSession(session)
    setNotes([])
    const res = await fetch(`/api/sessions/${session._id}/notes`)
    if (res.ok) {
      const data = await res.json()
      setNotes(data)
      setContent(data[0]?.content || '')
    }
  }

  const handleSave = async () => {
    if (!selectedSession) return
    setSaving(true)
    const res = await fetch(`/api/sessions/${selectedSession._id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      toast.success('Note saved')
      const updated = await res.json()
      setNotes([updated])
    } else {
      toast.error('Failed to save note')
    }
    setSaving(false)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      {/* Session list */}
      <div className="w-72 shrink-0 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Session Notes</h1>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Private — never visible to clients
        </p>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />) :
            sessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions yet</p>
            ) : sessions.map((s) => (
              <button key={s._id} onClick={() => loadNotes(s)}
                className={`w-full text-left rounded-xl border p-3 transition-all hover:border-brand-300 ${selectedSession?._id === s._id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-border'}`}>
                <p className="font-medium text-sm truncate">{s.clientId?.name ?? 'Client'}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(s.scheduledAt), 'EEE, d MMM')} · {s.duration}min</p>
                <span className={`badge text-xs mt-1 ${s.status === 'confirmed' ? 'badge-green' : s.status === 'completed' ? 'badge-blue' : 'badge-yellow'}`}>{s.status}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Note editor */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">Select a session</p>
              <p className="text-sm text-muted-foreground">Choose a session from the left to write or view notes</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedSession.clientId?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedSession.scheduledAt), 'EEEE, d MMMM yyyy • h:mm a')}
                </p>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary" id="notes-save">
                {saving ? 'Saving…' : 'Save Note'}
              </button>
            </div>

            {/* Simple rich textarea (Tiptap requires client boundary — using textarea for simplicity in SSR) */}
            <div className="flex-1 card overflow-hidden flex flex-col">
              <div className="border-b border-border px-4 py-2 flex gap-2 text-xs text-muted-foreground">
                <span className="font-mono">Session Note</span>
                <span>·</span>
                <span className={`h-1.5 w-1.5 self-center rounded-full ${saving ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span>{saving ? 'Saving…' : 'Auto-saved'}</span>
              </div>
              <textarea
                className="flex-1 p-4 bg-transparent resize-none focus:outline-none text-sm font-mono leading-relaxed"
                placeholder="Write session notes here…

Key observations:
- 

Client's reported concerns:
- 

Treatment progress:
- 

Next session plan:
- "
                value={content}
                onChange={(e) => setContent(e.target.value)}
                id="note-content"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
