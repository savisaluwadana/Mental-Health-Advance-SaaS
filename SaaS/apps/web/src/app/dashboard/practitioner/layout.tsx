import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardSidebar } from '@/components/DashboardSidebar'

export const metadata: Metadata = { title: 'Practitioner Dashboard' }

export default async function PractitionerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'psychologist' && session.user.role !== 'psychiatrist' && session.user.role !== 'counsellor')) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <DashboardSidebar role={session.user.role as 'psychologist' | 'psychiatrist'} />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
