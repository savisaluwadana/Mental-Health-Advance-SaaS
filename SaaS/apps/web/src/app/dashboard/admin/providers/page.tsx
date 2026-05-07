'use client'

import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Provider {
  _id: string
  name: string
  email: string
  role: string
  verified?: boolean
  province?: string
  languages?: string[]
  specialty?: string
  slmcRegNo?: string
  createdAt: string
}

const PROVIDER_ROLES = ['psychologist', 'psychiatrist', 'counsellor']

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'psychologist',
    password: '',
    province: '',
    languages: 'English, Sinhala',
    specialty: '',
    bio: '',
  })

  const pendingCount = useMemo(() => providers.filter((provider) => !provider.verified).length, [providers])

  const fetchProviders = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        const users = Array.isArray(data) ? data : []
        setProviders(users.filter((user) => PROVIDER_ROLES.includes(user.role)))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProviders() }, [])

  const toggleVerify = async (provider: Provider) => {
    setActioning(provider._id)
    const res = await fetch(`/api/admin/users/${provider._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: !provider.verified }),
    })

    if (res.ok) {
      toast.success(provider.verified ? 'Provider verification revoked' : 'Provider approved')
      fetchProviders()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to update provider')
    }
    setActioning(null)
  }

  const createProvider = async (event: React.FormEvent) => {
    event.preventDefault()
    setActioning('create')
    const res = await fetch('/api/admin/practitioners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        languages: form.languages.split(',').map((language) => language.trim()).filter(Boolean),
      }),
    })

    if (res.ok) {
      toast.success('Provider account created')
      setShowCreate(false)
      setForm({ name: '', email: '', role: 'psychologist', password: '', province: '', languages: 'English, Sinhala', specialty: '', bio: '' })
      fetchProviders()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Failed to create provider')
    }
    setActioning(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider CMS</h1>
          <p className="mt-1 text-muted-foreground">Approve, onboard, and manage psychologists, psychiatrists, and counsellors</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate((value) => !value)}>
          {showCreate ? 'Close Creator' : 'Create Provider'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Total Providers</p>
          <p className="mt-2 text-3xl font-bold">{providers.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Verified Network</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{providers.length - pendingCount}</p>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={createProvider} className="card grid gap-4 p-6 md:grid-cols-2">
          <input className="input-field" required placeholder="Full name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          <input className="input-field" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
          <select className="input-field" value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}>
            {PROVIDER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <input className="input-field" required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
          <input className="input-field" placeholder="Province" value={form.province} onChange={(e) => setForm((current) => ({ ...current, province: e.target.value }))} />
          <input className="input-field" placeholder="Languages, comma separated" value={form.languages} onChange={(e) => setForm((current) => ({ ...current, languages: e.target.value }))} />
          <input className="input-field" placeholder="Specialty" value={form.specialty} onChange={(e) => setForm((current) => ({ ...current, specialty: e.target.value }))} />
          <textarea className="input-field min-h-24 md:col-span-2" placeholder="Provider bio" value={form.bio} onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))} />
          <div className="md:col-span-2">
            <button className="btn-primary" disabled={actioning === 'create'} type="submit">Create Verified Provider</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">Provider</th>
                <th className="px-5 py-4 font-medium">Credential</th>
                <th className="px-5 py-4 font-medium">Coverage</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading providers...</td></tr>
              ) : providers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No providers found.</td></tr>
              ) : providers.map((provider) => (
                <tr key={provider._id} className="hover:bg-muted/10">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.email}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">Joined {format(new Date(provider.createdAt), 'MMM d, yyyy')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge badge-blue capitalize">{provider.role}</span>
                    {provider.slmcRegNo && <p className="mt-2 text-xs font-mono text-brand-600">SLMC: {provider.slmcRegNo}</p>}
                    {provider.specialty && <p className="mt-1 text-xs text-muted-foreground">{provider.specialty}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm">{provider.province || 'All provinces'}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{provider.languages?.join(', ') || 'Languages not set'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${provider.verified ? 'badge-green' : 'badge-yellow'}`}>
                      {provider.verified ? 'Verified' : 'Needs review'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="btn-secondary h-auto px-2.5 py-1.5 text-xs" disabled={actioning === provider._id} onClick={() => toggleVerify(provider)}>
                      {provider.verified ? 'Revoke Verification' : 'Approve Provider'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
