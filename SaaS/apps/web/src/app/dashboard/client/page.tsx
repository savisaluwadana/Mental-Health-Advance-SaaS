import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { asMongoDoc, asMongoSession, serverApi } from '@/lib/server-api'
import Link from 'next/link'
import { format, isToday } from 'date-fns'

export default async function ClientDashboardHome() {
  const session = await getServerSession(authOptions)!

  const [sessionsResult, moodResult, goalsResult] = await Promise.all([
    serverApi<{ sessions: any[] }>('/sessions'),
    serverApi<{ entries: any[] }>('/mood').catch(() => ({ entries: [] })),
    serverApi<{ goals: any[] }>('/goals'),
  ])
  const upcomingSessions = sessionsResult.sessions
    .map(asMongoSession)
    .filter((s: any) => ['pending', 'confirmed'].includes(s.status) && new Date(s.scheduledAt) >= new Date())
    .slice(0, 3)
  const todayMood = moodResult.entries.map(asMongoDoc).find((entry: any) => isToday(new Date(entry.date)))
  const activeGoals = goalsResult.goals.map(asMongoDoc).filter((goal: any) => !goal.completedAt).slice(0, 5)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold">
          {greeting()}, {session!.user.name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* Today's mood prompt */}
      {!todayMood && (
        <div className="card p-6 border-brand-200 bg-gradient-to-r from-brand-50 to-background dark:from-brand-900/20 dark:border-brand-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h2 className="font-semibold text-lg">How are you feeling today?</h2>
              <p className="text-muted-foreground text-sm mt-1">
                You haven&apos;t logged your mood yet. It takes just a moment.
              </p>
            </div>
            <Link href="/dashboard/client/mood" className="btn-primary shrink-0">
              Log Mood
            </Link>
          </div>
        </div>
      )}

      {todayMood && (
        <div className="card p-6 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-green-700 shadow-sm dark:bg-white/10 dark:text-green-300">
              {todayMood.score >= 8 ? 'High' : todayMood.score >= 5 ? 'Mid' : 'Low'}
            </span>
            <div>
              <p className="font-semibold">Mood logged today — {todayMood.score}/10</p>
              <p className="text-sm text-muted-foreground">
                {todayMood.emotions.join(', ') || 'No emotions tagged'}
              </p>
            </div>
            <Link href="/dashboard/client/mood" className="btn-ghost sm:ml-auto text-sm">
              Update
            </Link>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Sessions', value: upcomingSessions.length, icon: 'US', href: '/dashboard/client/schedule' },
          { label: 'Active Goals', value: activeGoals.length, icon: 'AG', href: '/dashboard/client/goals' },
          { label: 'Mood Streak', value: todayMood ? 'Active' : '-', icon: 'MS', href: '/dashboard/client/mood' },
          { label: 'Messages', value: '-', icon: 'ME', href: '/dashboard/client/messages' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="stat-card hover:shadow-md transition-shadow cursor-pointer group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{stat.icon}</span>
            <p className="stat-value text-2xl group-hover:text-brand-600 transition-colors">{stat.value}</p>
            <p className="stat-label text-xs">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Link href="/dashboard/client/schedule" className="text-sm text-brand-600 hover:underline">
            Book more →
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium">No upcoming sessions</p>
            <p className="text-sm text-muted-foreground mb-4">Book a session with one of our practitioners</p>
            <Link href="/dashboard/client/schedule" className="btn-primary">Find a Therapist</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((s: any) => (
              <div key={s._id.toString()} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {s.type === 'online' ? 'ON' : 'IP'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {(s.practitionerId as any)?.name ?? 'Practitioner'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(s.scheduledAt), 'EEE, d MMM • h:mm a')} · {s.duration}min
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${s.status === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}>
                    {s.status}
                  </span>
                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="btn-primary text-xs px-3 py-1.5">
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Goals</h2>
            <Link href="/dashboard/client/goals" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {activeGoals.map((goal: any) => (
              <div key={goal._id.toString()} className="card p-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">GO</span>
                <div className="flex-1">
                  <p className="font-medium">{goal.title}</p>
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground">
                      Target: {format(new Date(goal.targetDate), 'd MMM yyyy')}
                    </p>
                  )}
                </div>
                <Link href="/dashboard/client/goals" className="btn-ghost text-xs py-1">Check In</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
