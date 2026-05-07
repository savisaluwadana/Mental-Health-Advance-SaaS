import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardSidebar } from '@/components/DashboardSidebar'

export const metadata: Metadata = { title: 'Client Dashboard' }

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'client') redirect('/login')

  return (
    <div className="dashboard-shell client-dashboard-shell flex bg-background">
      <DashboardSidebar role="client" />
      <main className="dashboard-main flex-1 pt-16 md:pt-0">
        <div className="mx-auto max-w-screen-2xl p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
