'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

interface MoodEntry { _id: string; date: string; score: number; emotions: string[]; note?: string }
interface Goal { _id: string; title: string; description?: string; targetDate?: string; completedAt?: string; weeklyCheckIns: { week: string; progressRating: number; note?: string }[] }

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return

    Promise.all([
      fetch(`/api/mood?clientId=${params.id}`).then(r => r.json()),
      fetch(`/api/goals?clientId=${params.id}`).then(r => r.json())
    ]).then(([moodData, goalData]) => {
      setMoods(Array.isArray(moodData) ? moodData : [])
      setGoals(Array.isArray(goalData) ? goalData : [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [params.id])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border pb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold">Client Clinical Profile</h1>
          <p className="text-muted-foreground mt-1">View patient's shared mood tracking and goal progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Tracking */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mood History</h2>
            <span className="text-xs badge badge-blue">Last 30 Days</span>
          </div>
          
          <div className="space-y-4">
            {loading ? <p className="animate-pulse text-muted-foreground text-sm">Loading moods...</p> : 
             moods.length === 0 ? (
              <div className="card p-6 text-center text-muted-foreground">
                <p>No mood entries shared yet.</p>
              </div>
            ) : moods.map(mood => (
              <div key={mood._id} className="card p-4 border-l-4" style={{ borderLeftColor: mood.score > 7 ? '#10b981' : mood.score >= 4 ? '#eab308' : '#ef4444' }}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{mood.score}/10</span>
                    <span className="text-sm font-medium text-muted-foreground">{format(new Date(mood.date), 'EEEE, d MMM')}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-start sm:justify-end sm:max-w-[50%]">
                    {mood.emotions.map(e => <span key={e} className="badge badge-yellow text-[10px] capitalize">{e}</span>)}
                  </div>
                </div>
                {mood.note && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm border border-border/50">
                    <span className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Patient Note:</span>
                    <p className="whitespace-pre-wrap">{mood.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Goals & Notes */}
        <div>
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Treatment Goals</h2>
          </div>

          <div className="space-y-4">
            {loading ? <p className="animate-pulse text-muted-foreground text-sm">Loading goals...</p> : 
             goals.length === 0 ? (
              <div className="card p-6 text-center text-muted-foreground">
                <p>No active treatment goals established.</p>
              </div>
            ) : goals.map(goal => (
              <div key={goal._id} className="card p-5 relative overflow-hidden">
                {goal.completedAt && <div className="absolute top-0 right-0 p-1 bg-green-500 text-white text-[10px] font-bold rounded-bl uppercase">Completed</div>}
                
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                
                {goal.targetDate && <p className="text-xs font-medium mt-3">Target: {format(new Date(goal.targetDate), 'PPP')}</p>}

                {goal.weeklyCheckIns && goal.weeklyCheckIns.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Patient Check-ins</p>
                    {goal.weeklyCheckIns.map((checkin, idx) => (
                      <div key={idx} className="bg-brand-50/50 dark:bg-brand-900/10 p-3 rounded border border-brand-100 dark:border-brand-900">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{format(new Date(checkin.week), 'MMM d, yyyy')}</span>
                          <span className="badge badge-blue text-[10px]">Progress: {checkin.progressRating}/5</span>
                        </div>
                        {checkin.note && <p className="text-sm italic text-muted-foreground mt-1">"{checkin.note}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
