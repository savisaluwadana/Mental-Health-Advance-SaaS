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
    <div className="flex min-h-screen overflow-hidden bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
