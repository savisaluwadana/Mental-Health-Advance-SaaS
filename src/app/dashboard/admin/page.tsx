'use client'

import { useState, useEffect } from 'react'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ users: 0, pendingPractitioners: 0, keywords: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/keywords').then(r => r.json())
    ]).then(([users, keywords]) => {
      setStats({
        users: users.length,
        pendingPractitioners: users.filter((u: any) => 
          (u.role === 'psychologist' || u.role === 'psychiatrist') && !u.verified
        ).length,
        keywords: keywords.length
      })
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-32" />) : (
          <>
            <div className="card p-6 bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
              <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
               <p className="text-4xl font-bold mt-2 text-brand-600 dark:text-brand-400">{stats.users}</p>
            </div>
            
            <div className="card p-6 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Validations</h3>
              <p className="text-4xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{stats.pendingPractitioners}</p>
            </div>
            
            <div className="card p-6 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <h3 className="text-sm font-medium text-muted-foreground">Safety Keywords Active</h3>
              <p className="text-4xl font-bold mt-2 text-red-600 dark:text-red-400">{stats.keywords}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="card p-6 mt-8">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/dashboard/admin/users" className="btn-primary">Manage Users</a>
          <a href="/dashboard/admin/keywords" className="btn-secondary">Configure Safety Engine</a>
        </div>
      </div>
    </div>
  )
}
