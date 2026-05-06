'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format } from 'date-fns'

interface MoodEntry { _id: string; date: string; score: number }
interface Goal { _id: string; title: string; completedAt?: string }
interface SessionEntry { _id: string; scheduledAt: string; status: string }

const COLORS = ['#14b89a', '#e5e7eb']

export default function ClientProgressPage() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/mood?days=${days}`).then((r) => r.json()),
      fetch('/api/goals').then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
    ]).then(([mood, g, sess]) => {
      setMoodData(mood)
      setGoals(g)
      setSessions(sess)
      setLoading(false)
    })
  }, [days])

  const completedGoals = goals.filter((g) => g.completedAt)
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0
  const attendedSessions = sessions.filter((s) => s.status === 'completed').length

  const chartData = moodData
    .slice(0, days)
    .reverse()
    .map((e) => ({ date: format(new Date(e.date), 'MMM d'), score: e.score }))

  const avgMood = moodData.length > 0
    ? Math.round(moodData.reduce((s, e) => s + e.score, 0) / moodData.length * 10) / 10
    : 0

  const pieData = [
    { name: 'Completed', value: completedGoals.length },
    { name: 'Active', value: goals.length - completedGoals.length },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Progress Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your mental health journey at a glance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={d === days ? 'btn-primary text-sm px-4 py-2' : 'btn-secondary text-sm px-4 py-2'}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Mood Score', value: avgMood || '—', hint: 'out of 10' },
          { label: 'Mood Entries', value: moodData.length, hint: `last ${days} days` },
          { label: 'Goals Completed', value: `${completedGoals.length}/${goals.length}`, hint: `${completionRate}% rate` },
          { label: 'Sessions Attended', value: attendedSessions, hint: 'completed' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label text-xs">{stat.label}</p>
            <p className="stat-value text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Mood Trend — Last {days} Days</h2>
        {loading ? (
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}/10`, 'Mood']} />
              <Line type="monotone" dataKey="score" stroke="#14b89a" strokeWidth={2.5}
                dot={{ r: 3, fill: '#14b89a' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No mood data for this period. Start logging!</p>
          </div>
        )}
      </div>

      {/* Goals pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Goals Completion</h2>
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No goals yet</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <PieChart width={120} height={120}>
                <Pie data={pieData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-brand-500" />
                  <span className="text-sm">{completedGoals.length} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm">{goals.length - completedGoals.length} Active</span>
                </div>
                <p className="text-2xl font-bold text-brand-600">{completionRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Session history */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Session History</h2>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No session history yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.slice(0, 10).map((s) => (
                <div key={s._id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{format(new Date(s.scheduledAt), 'EEE, d MMM')}</span>
                  <span className={`badge ${s.status === 'completed' ? 'badge-green' : s.status === 'confirmed' ? 'badge-blue' : s.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
