'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { asArray, asItem } from '@/lib/api-data'

const EMOTIONS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Hopeful', 'Overwhelmed', 'Grateful', 'Lonely', 'Excited', 'Tired', 'Confused']
const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low', 2: 'Low', 3: 'Uneasy', 4: 'Flat', 5: 'Steady', 6: 'Okay', 7: 'Good', 8: 'Strong', 9: 'Bright', 10: 'Excellent',
}

interface MoodEntry { _id: string; date: string; score: number; emotions: string[]; note?: string; sharedWithPractitioner: boolean }

function getMoodEntries(data: unknown): MoodEntry[] {
  return asArray<MoodEntry>(data, 'entries')
}

export default function MoodTrackerPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [score, setScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [shared, setShared] = useState(false)
  const [saving, setSaving] = useState(false)
  const [todayLogged, setTodayLogged] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'log' | 'history'>('log')

  useEffect(() => {
    fetch('/api/mood?days=30')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          throw new Error(data?.error ?? 'Failed to load mood entries')
        }
        return data
      })
      .then((data) => {
        const moodEntries = getMoodEntries(data)
        setEntries(moodEntries)
        const today = new Date().toDateString()
        const todayEntry = moodEntries.find((e) => new Date(e.date).toDateString() === today)
        if (todayEntry) {
          setTodayLogged(true)
          setScore(todayEntry.score)
          setSelectedEmotions(todayEntry.emotions ?? [])
          setNote(todayEntry.note || '')
          setShared(todayEntry.sharedWithPractitioner)
        }
        setLoading(false)
      })
      .catch((error) => {
        setEntries([])
        setLoading(false)
        toast.error(error instanceof Error ? error.message : 'Failed to load mood entries')
      })
  }, [])

  const toggleEmotion = (e: string) => {
    setSelectedEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, emotions: selectedEmotions, note, sharedWithPractitioner: shared }),
    })
    if (res.ok) {
      const updated = asItem<MoodEntry>(await res.json(), 'entry')
      if (!updated) {
        toast.error('Saved mood, but the response was invalid')
        setSaving(false)
        return
      }
      setTodayLogged(true)
      setEntries((prev) => {
        const today = new Date().toDateString()
        const filtered = prev.filter((e) => new Date(e.date).toDateString() !== today)
        return [updated, ...filtered]
      })
      toast.success(todayLogged ? 'Mood updated!' : 'Mood logged!')
    } else {
      toast.error('Failed to save mood')
    }
    setSaving(false)
  }

  const chartData = entries
    .slice(0, 30)
    .reverse()
    .map((e) => ({ date: format(new Date(e.date), 'MMM d'), score: e.score }))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mood Tracker</h1>
          <p className="text-muted-foreground mt-1">Track how you&apos;re feeling each day</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('log')} className={view === 'log' ? 'btn-primary' : 'btn-secondary'}>
            Log Today
          </button>
          <button onClick={() => setView('history')} className={view === 'history' ? 'btn-primary' : 'btn-secondary'}>
            History
          </button>
        </div>
      </div>

      {view === 'log' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Score slider */}
          <div className="card p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-sm font-bold text-brand-700 shadow-inner dark:bg-brand-900/30 dark:text-brand-300">{MOOD_LABELS[score]}</div>
              <p className="text-2xl font-bold">{score} / 10</p>
              <p className="text-muted-foreground text-sm">How are you feeling right now?</p>
            </div>
            <input
              type="range" min={1} max={10} value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-brand-600"
              id="mood-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Emotions + note */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="label block mb-3">Emotion Tags</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((em) => (
                  <button key={em} type="button" onClick={() => toggleEmotion(em)}
                    className={`rounded-full border px-3 py-1 text-sm transition-all ${
                      selectedEmotions.includes(em)
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                        : 'border-border hover:border-brand-300'
                    }`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="mood-note" className="label block mb-1.5">Note <span className="text-muted-foreground text-xs">(optional)</span></label>
              <textarea
                id="mood-note"
                rows={3}
                maxLength={500}
                className="input-field w-full resize-none"
                placeholder="What's on your mind today?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{note.length}/500</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setShared(!shared)}
                className={`relative h-6 w-11 rounded-full transition-colors ${shared ? 'bg-brand-600' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${shared ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm">Share with my practitioner</span>
            </label>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full" id="mood-save">
              {saving ? 'Saving…' : todayLogged ? 'Update Today\'s Mood' : 'Log Today\'s Mood'}
            </button>
          </div>
        </div>
      )}

      {view === 'history' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Mood Trend — Last 30 Days</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#14b89a" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#14b89a' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">No mood data yet. Start logging!</p>
            )}
          </div>

          {/* Past entries */}
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse h-16" />
              ))
            ) : entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No entries yet</p>
            ) : (
              entries.map((entry) => (
                <div key={entry._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{entry.score}/10</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{format(new Date(entry.date), 'EEE, d MMM yyyy')}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {entry.emotions.join(', ') || 'No tags'}{entry.note ? ` · ${entry.note.slice(0, 60)}…` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="badge badge-green">{entry.score}/10</span>
                    {entry.sharedWithPractitioner && (
                      <span className="badge badge-blue text-xs">Shared</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
