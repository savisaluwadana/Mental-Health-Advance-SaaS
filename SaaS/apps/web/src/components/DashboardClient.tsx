'use client'

import type { AuthUser } from '@mindbridge/shared'
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

type Session = {
  id: string
  scheduledAt: string
  status: string
  type: string
  practitioner?: { name: string; specialty?: string | null }
  client?: { name: string }
}

type MoodEntry = {
  id: string
  date: string
  score: number
  emotions: string[]
  note?: string | null
}

type Goal = {
  id: string
  title: string
  description?: string | null
  completedAt?: string | null
}

type Client = {
  id: string
  name: string
  email: string
  province?: string | null
}

type Message = {
  id: string
  content: string
  flagged: boolean
  flagReasons: string[]
  sender: { id: string; name: string }
  receiver: { id: string; name: string }
}

type Prescription = {
  id: string
  issuedAt: string
  status: string
  medications: Array<{ id: string; name: string; dosage: string; frequency: string; duration: string }>
  client?: { name: string }
  psychiatrist?: { name: string; slmcRegNo?: string | null }
}

type SafetyAlert = {
  id: string
  status: string
  reasons: string[]
  client: { name: string }
  message: { content: string }
}

type AdminStats = {
  users: number
  sessions: number
  pendingSafetyAlerts: number
  prescriptions: number
}

export function DashboardClient() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [alerts, setAlerts] = useState<SafetyAlert[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [messageText, setMessageText] = useState('I am checking in from the new platform.')
  const [receiverId, setReceiverId] = useState('')
  const [status, setStatus] = useState('Loading dashboard...')

  useEffect(() => {
    const savedToken = localStorage.getItem('mindbridge_token')
    if (!savedToken) {
      setStatus('Please sign in from the home page first.')
      return
    }

    setToken(savedToken)

    apiFetch<AuthUser>('/auth/me', {}, savedToken)
      .then(async (me) => {
        const [sessionResult, goalResult, moodResult, prescriptionResult] = await Promise.all([
          apiFetch<{ sessions: Session[] }>('/sessions', {}, savedToken),
          apiFetch<{ goals: Goal[] }>('/goals', {}, savedToken),
          apiFetch<{ entries: MoodEntry[] }>('/mood', {}, savedToken).catch(() => ({ entries: [] })),
          apiFetch<{ prescriptions: Prescription[] }>('/prescriptions', {}, savedToken).catch(() => ({ prescriptions: [] })),
        ])

        if (me.role !== 'client') {
          const clientResult = await apiFetch<{ clients: Client[] }>('/clients', {}, savedToken).catch(() => ({ clients: [] }))
          const alertResult = await apiFetch<{ alerts: SafetyAlert[] }>('/messages/alerts', {}, savedToken).catch(() => ({
            alerts: [],
          }))
          setClients(clientResult.clients)
          setAlerts(alertResult.alerts)
          setReceiverId(clientResult.clients[0]?.id ?? '')
        }

        if (me.role === 'admin') {
          const statsResult = await apiFetch<{ stats: AdminStats }>('/admin/stats', {}, savedToken).catch(() => ({ stats: null }))
          setStats(statsResult.stats)
        }

        setUser(me)
        setSessions(sessionResult.sessions)
        setGoals(goalResult.goals)
        setMoodEntries(moodResult.entries)
        setPrescriptions(prescriptionResult.prescriptions)
        setStatus('')
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : 'Unable to load dashboard.'))
  }, [])

  async function addMoodEntry() {
    if (!token) return
    const result = await apiFetch<{ entry: MoodEntry }>(
      '/mood',
      {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString(),
          score: 8,
          emotions: ['steady', 'supported'],
          note: 'Demo check-in from the refactored dashboard.',
          sharedWithPractitioner: true,
        }),
      },
      token,
    )
    setMoodEntries((entries) => [result.entry, ...entries.filter((entry) => entry.id !== result.entry.id)])
  }

  async function sendMessage() {
    if (!token || !receiverId || !messageText) return
    const result = await apiFetch<{ message: Message }>(
      '/messages',
      {
        method: 'POST',
        body: JSON.stringify({ receiverId, content: messageText }),
      },
      token,
    )
    setMessages((items) => [...items, result.message])
    setMessageText('')
  }

  async function issueDemoPrescription() {
    if (!token || !receiverId) return
    const result = await apiFetch<{ prescription: Prescription }>(
      '/prescriptions',
      {
        method: 'POST',
        body: JSON.stringify({
          clientId: receiverId,
          signatureDataUrl: 'data:image/png;base64,demo-signature',
          sealDataUrl: 'data:image/png;base64,demo-seal',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          medications: [
            {
              name: 'Demo medication',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '14 days',
            },
          ],
        }),
      },
      token,
    )
    setPrescriptions((items) => [result.prescription, ...items])
  }

  if (status) {
    return <div className="panel shell mt-10 p-8 text-center font-bold text-lagoon">{status}</div>
  }

  return (
    <main className="shell py-10">
      <div className="panel overflow-hidden">
        <div className="bg-lagoon p-8 text-white">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-reef">Care Workspace</p>
          <h1 className="mt-2 font-display text-4xl font-black">Welcome back, {user?.name}</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Role-aware dashboard for {user?.role}. Clinical notes remain practitioner-only, while client progress
            focuses on sessions, mood trends, and goals.
          </p>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-3">
          {stats ? (
            <section className="rounded-[1.5rem] bg-amber-50 p-5 lg:col-span-3">
              <h2 className="font-display text-2xl font-black text-lagoon">Admin Overview</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {Object.entries(stats).map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-lagoon">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <h2 className="font-display text-2xl font-black text-lagoon">Sessions</h2>
            <div className="mt-4 space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-lagoon/10 p-4">
                  <p className="font-bold text-lagoon">{new Date(session.scheduledAt).toLocaleString()}</p>
                  <p className="text-sm text-slate-600">
                    {session.practitioner?.name ?? session.client?.name} · {session.type} · {session.status}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-black text-lagoon">Mood</h2>
              {user?.role === 'client' ? (
                <button className="button-soft py-2" onClick={addMoodEntry}>
                  Add demo
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {moodEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-lagoon/10 p-4">
                  <p className="font-bold text-lagoon">Score {entry.score}/10</p>
                  <p className="text-sm text-slate-600">{entry.emotions.join(', ')}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <h2 className="font-display text-2xl font-black text-lagoon">Goals</h2>
            <div className="mt-4 space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-lagoon/10 p-4">
                  <p className="font-bold text-lagoon">{goal.title}</p>
                  <p className="text-sm text-slate-600">{goal.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <h2 className="font-display text-2xl font-black text-lagoon">Clients</h2>
            <div className="mt-4 space-y-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className={`w-full rounded-2xl border p-4 text-left ${receiverId === client.id ? 'border-reef bg-reef/10' : 'border-lagoon/10'}`}
                  onClick={() => setReceiverId(client.id)}
                >
                  <p className="font-bold text-lagoon">{client.name}</p>
                  <p className="text-sm text-slate-600">{client.email}</p>
                </button>
              ))}
              {!clients.length && <p className="text-sm text-slate-500">No assigned clients yet.</p>}
            </div>
          </section>
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <h2 className="font-display text-2xl font-black text-lagoon">Messages & Safety</h2>
            <textarea className="input mt-4 min-h-28" value={messageText} onChange={(event) => setMessageText(event.target.value)} />
            <button className="button-primary mt-3 w-full" onClick={sendMessage}>
              Send message
            </button>
            <div className="mt-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-lagoon/10 p-4">
                  <p className="text-sm text-slate-600">{message.content}</p>
                  {message.flagged ? <p className="mt-2 text-xs font-black text-red-600">Flagged: {message.flagReasons.join(', ')}</p> : null}
                </div>
              ))}
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-bold text-red-800">{alert.client.name}: {alert.status}</p>
                  <p className="text-sm text-red-700">{alert.message.content}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] bg-white/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-black text-lagoon">Prescriptions</h2>
              {user?.role === 'psychiatrist' || user?.role === 'admin' ? (
                <button className="button-soft py-2" onClick={issueDemoPrescription}>
                  Issue demo
                </button>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="rounded-2xl border border-lagoon/10 p-4">
                  <p className="font-bold text-lagoon">{prescription.status} prescription</p>
                  <p className="text-sm text-slate-600">
                    {prescription.medications.map((medication) => medication.name).join(', ') || 'No medication lines'}
                  </p>
                </div>
              ))}
              {!prescriptions.length && <p className="text-sm text-slate-500">No prescriptions recorded.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
