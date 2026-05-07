'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { asArray } from '@/lib/api-data'

interface ClientInfo { _id: string; name: string; email: string; avatar?: string }
interface Session { _id: string; clientId: ClientInfo; scheduledAt: string; status: string; type: string }

export default function MyClientsPage() {
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then((data) => {
      const sessions = asArray<Session>(data, 'sessions')
      // Extract unique clients
      const uniqueClients = new Map<string, ClientInfo>()
      sessions.forEach(s => {
        if (s.clientId && !uniqueClients.has(s.clientId._id)) {
          uniqueClients.set(s.clientId._id, s.clientId)
        }
      })
      setClients(Array.from(uniqueClients.values()))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Clients</h1>
        <p className="text-muted-foreground mt-1">View the clients you are currently working with</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-32" />) :
          clients.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-16">No clients found</p>
          ) : clients.map((c) => (
            <Link href={`/dashboard/practitioner/clients/${c._id}`} key={c._id} className="card p-5 hover:shadow-md hover:border-brand-300 transition-all block group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-lg font-bold transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/30 dark:text-brand-300 dark:group-hover:bg-brand-700 dark:group-hover:text-white">
                    {c.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-lg truncate">{c.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{c.email}</p>
                  </div>
                </div>
                <div className="text-muted-foreground group-hover:text-brand-600 transition-colors mt-3">
                   <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}
