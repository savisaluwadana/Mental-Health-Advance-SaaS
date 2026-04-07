'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Goal { _id: string; title: string; description?: string; targetDate?: string; completedAt?: string; weeklyCheckIns: { week: string; progressRating: number; note?: string }[] }

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [checkInGoalId, setCheckInGoalId] = useState<string | null>(null)
  const [checkInForm, setCheckInForm] = useState({ progressRating: 3, note: '' })
  const [saving, setSaving] = useState(false)
  const [celebrating, setCelebrating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/goals').then((r) => r.json()).then((data) => { setGoals(data); setLoading(false) })
  }, [])

  const handleCheckIn = async (goalId: string) => {
    setSaving(true)
    const res = await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: goalId,
        weeklyCheckIn: { week: new Date().toISOString(), ...checkInForm },
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setGoals((prev) => prev.map((g) => g._id === goalId ? updated : g))
      setCheckInGoalId(null)
      toast.success('Check-in logged! 💪')
    } else { toast.error('Failed to log check-in') }
    setSaving(false)
  }

  const handleComplete = async (goalId: string) => {
    const res = await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, completedAt: new Date().toISOString() }),
    })
    if (res.ok) {
      const updated = await res.json()
      setGoals((prev) => prev.map((g) => g._id === goalId ? updated : g))
      setCelebrating(goalId)
      toast.success('🎉 Goal completed! Amazing work!')
      setTimeout(() => setCelebrating(null), 3000)
    }
  }

  const activeGoals = goals.filter((g) => !g.completedAt)
  const completedGoals = goals.filter((g) => g.completedAt)
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals & Check-Ins</h1>
          <p className="text-muted-foreground mt-1">Goals set by your practitioner — track your progress weekly</p>
        </div>
        {goals.length > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-600">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">goals completed</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {goals.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{completedGoals.length} / {goals.length} completed</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        [...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-28" />)
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-lg">No goals yet</p>
          <p className="text-muted-foreground text-sm mt-1">Your practitioner will set goals for you during sessions</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold">Active Goals ({activeGoals.length})</h2>
          {activeGoals.map((goal) => (
            <div key={goal._id} className={`card p-5 transition-all ${celebrating === goal._id ? 'ring-2 ring-brand-500 scale-[1.01]' : ''}`}>
              {celebrating === goal._id && (
                <div className="text-center py-4 text-4xl animate-bounce">🎉🎊🏆</div>
              )}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold">{goal.title}</p>
                  {goal.description && <p className="text-sm text-muted-foreground mt-0.5">{goal.description}</p>}
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      🗓 Target: {format(new Date(goal.targetDate), 'd MMM yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setCheckInGoalId(checkInGoalId === goal._id ? null : goal._id)}
                    className="btn-secondary text-xs px-3 py-1.5">
                    {checkInGoalId === goal._id ? 'Cancel' : 'Check In'}
                  </button>
                  <button onClick={() => handleComplete(goal._id)}
                    className="btn-primary text-xs px-3 py-1.5">
                    ✓ Complete
                  </button>
                </div>
              </div>

              {/* Weekly check history */}
              {goal.weeklyCheckIns.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {goal.weeklyCheckIns.slice(-8).map((ci, i) => (
                    <div key={i} title={`Week of ${format(new Date(ci.week), 'd MMM')}: ${ci.progressRating}/5`}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                      style={{ backgroundColor: `hsl(${ci.progressRating * 30}, 60%, ${ci.progressRating > 3 ? '85%' : '80%'})` }}>
                      {ci.progressRating}
                    </div>
                  ))}
                </div>
              )}

              {/* Check-in form */}
              {checkInGoalId === goal._id && (
                <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3 dark:bg-brand-900/10 dark:border-brand-800">
                  <p className="text-sm font-medium">Weekly Check-In</p>
                  <div>
                    <label className="label text-xs mb-1 block">Progress Rating (1–5)</label>
                    <input type="range" min={1} max={5} value={checkInForm.progressRating}
                      onChange={(e) => setCheckInForm({ ...checkInForm, progressRating: Number(e.target.value) })}
                      className="w-full accent-brand-600" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Struggling</span><span>{checkInForm.progressRating}/5</span><span>Excellent</span>
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs mb-1 block">Note (optional)</label>
                    <textarea rows={2} className="input-field w-full resize-none text-sm" placeholder="What progress did you make?"
                      value={checkInForm.note} onChange={(e) => setCheckInForm({ ...checkInForm, note: e.target.value })} />
                  </div>
                  <button onClick={() => handleCheckIn(goal._id)} disabled={saving} className="btn-primary text-sm px-4 py-2">
                    {saving ? 'Saving…' : 'Submit Check-In'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {completedGoals.length > 0 && (
            <>
              <h2 className="font-semibold mt-6">Completed ({completedGoals.length})</h2>
              {completedGoals.map((goal) => (
                <div key={goal._id} className="card p-4 opacity-70 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-medium line-through text-muted-foreground">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {format(new Date(goal.completedAt!), 'd MMM yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
