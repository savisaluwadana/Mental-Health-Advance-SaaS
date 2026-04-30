import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SessionModel from '@/models/Session'
import Message from '@/models/Message'
import ClientProfile from '@/models/ClientProfile'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default async function PractitionerDashboardHome() {
  const session = await getServerSession(authOptions)!
  await connectDB()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  const [todaySessions, weekSessions, flaggedMessages, totalClients] = await Promise.all([
    SessionModel.find({
      practitionerId: session!.user.id,
      scheduledAt: { $gte: today, $lt: todayEnd },
      status: { $in: ['pending', 'confirmed'] },
    }).populate('clientId', 'name avatar email').sort({ scheduledAt: 1 }).lean(),
    SessionModel.countDocuments({
      practitionerId: session!.user.id,
      scheduledAt: { $gte: weekStart, $lte: weekEnd },
      status: { $in: ['confirmed', 'completed'] },
    }),
    Message.find({ receiverId: session!.user.id, flagged: true })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    ClientProfile.countDocuments({ assignedPractitionerId: session!.user.id }),
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {session!.user.name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy')} · {session!.user.role === 'psychiatrist' ? 'Psychiatrist' : 'Psychologist'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Sessions", value: todaySessions.length, icon: 'TS', href: '/dashboard/practitioner/schedule' },
          { label: 'Sessions This Week', value: weekSessions, icon: 'SW', href: '/dashboard/practitioner/schedule' },
          { label: 'Total Clients', value: totalClients, icon: 'TC', href: '/dashboard/practitioner/clients' },
          { label: 'Flagged Messages', value: flaggedMessages.length, icon: 'FM', href: '/dashboard/practitioner/messages' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`stat-card hover:shadow-md transition-shadow cursor-pointer group ${stat.label === 'Flagged Messages' && flaggedMessages.length > 0 ? 'border-red-200 dark:border-red-800' : ''}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${stat.label === 'Flagged Messages' && flaggedMessages.length > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'}`}>{stat.icon}</span>
            <p className={`stat-value text-2xl group-hover:text-brand-600 transition-colors ${stat.label === 'Flagged Messages' && flaggedMessages.length > 0 ? 'text-red-600' : ''}`}>
              {stat.value}
            </p>
            <p className="stat-label text-xs">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Today's sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Schedule</h2>
        {todaySessions.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">DAY</div>
            <p className="font-medium">No sessions today</p>
            <p className="text-sm text-muted-foreground">Enjoy a free day or check your upcoming schedule</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySessions.map((s: any) => (
              <div key={s._id.toString()} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-center min-w-[52px]">
                  <p className="text-lg font-bold text-brand-600">{format(new Date(s.scheduledAt), 'h:mm')}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(s.scheduledAt), 'a')}</p>
                </div>
                <div className="hidden sm:block h-10 w-0.5 bg-brand-200 dark:bg-brand-800 rounded-full" />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                  {s.clientId?.name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.clientId?.name ?? 'Client'}</p>
                  <p className="text-sm text-muted-foreground">{s.duration}min · {s.type}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${s.status === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}>{s.status}</span>
                  {s.status === 'pending' && (
                    <Link href={`/dashboard/practitioner/schedule`} className="btn-primary text-xs px-3 py-1.5">Confirm</Link>
                  )}
                  {s.meetingLink && s.status === 'confirmed' && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-3 py-1.5">Start</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flagged message alerts */}
      {flaggedMessages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              Alert Inbox
            </h2>
            <Link href="/dashboard/practitioner/messages" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {flaggedMessages.map((msg: any) => (
              <div key={msg._id.toString()} className="card p-4 border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/30">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">!</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-800 dark:text-red-300">
                      {(msg.senderId as any)?.name ?? 'Client'}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 line-clamp-2">
                      &quot;{msg.content}&quot;
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.flagReasons.map((r: string, i: number) => (
                        <span key={i} className="badge badge-red text-xs">{r}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(msg.createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
