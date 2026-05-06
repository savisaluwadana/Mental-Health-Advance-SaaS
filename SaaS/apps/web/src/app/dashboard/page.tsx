import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function DashboardIndexPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = session.user.role
  if (role === 'admin') redirect('/dashboard/admin')
  if (role === 'psychologist' || role === 'psychiatrist' || role === 'counsellor') {
    redirect('/dashboard/practitioner')
  }

  redirect('/dashboard/client')
}
