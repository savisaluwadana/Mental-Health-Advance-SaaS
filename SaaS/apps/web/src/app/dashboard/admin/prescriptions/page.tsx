'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface Person {
  _id: string
  name: string
  email: string
  phone?: string
}

interface Medication {
  id?: string
  _id?: string
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface Prescription {
  _id: string
  clientId: Person
  psychiatristId: Person
  medications: Medication[]
  issuedAt: string
  expiresAt: string
  status: string
}

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [loading, setLoading] = useState(true)

  const fetchPrescriptions = () => {
    setLoading(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
    fetch(`/api/admin/prescriptions?${params}`)
      .then((res) => res.json())
      .then((data) => setPrescriptions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(fetchPrescriptions, 350)
    return () => clearTimeout(timer)
  }, [filters])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Prescription Registry</h1>
        <p className="mt-1 text-muted-foreground">Audit issued prescriptions, expiry windows, medications, and printable PDFs</p>
      </div>

      <div className="card grid gap-3 bg-muted/30 p-4 md:grid-cols-[1fr_180px]">
        <input
          className="input-field"
          placeholder="Search client or psychiatrist..."
          value={filters.search}
          onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        />
        <select className="input-field" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {loading ? (
          [...Array(4)].map((_, index) => <div key={index} className="card h-56 animate-pulse p-6" />)
        ) : prescriptions.length === 0 ? (
          <div className="card p-8 text-center text-muted-foreground xl:col-span-2">No prescriptions found.</div>
        ) : prescriptions.map((prescription) => (
          <div key={prescription._id} className="card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge capitalize ${prescription.status === 'active' ? 'badge-green' : prescription.status === 'revoked' ? 'badge-red' : 'badge-yellow'}`}>{prescription.status}</span>
                  <span className="text-xs text-muted-foreground">Issued {format(new Date(prescription.issuedAt), 'MMM d, yyyy')}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold">{prescription.clientId?.name || 'Unknown client'}</h2>
                <p className="text-sm text-muted-foreground">{prescription.clientId?.email}</p>
                {prescription.clientId?.phone && <p className="text-sm text-muted-foreground">{prescription.clientId.phone}</p>}
              </div>
              <a className="btn-secondary h-auto px-3 py-2 text-sm" href={`/api/prescriptions/${prescription._id}/pdf`} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            </div>

            <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Psychiatrist</p>
                <p className="font-semibold">{prescription.psychiatristId?.name || 'Unknown psychiatrist'}</p>
                <p className="text-xs text-muted-foreground">{prescription.psychiatristId?.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expires</p>
                <p className="font-semibold">{format(new Date(prescription.expiresAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border">
              {prescription.medications?.length ? prescription.medications.map((medication) => (
                <div key={medication._id || medication.id || medication.name} className="border-b border-border p-4 last:border-0">
                  <p className="font-semibold">{medication.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{medication.dosage} · {medication.frequency} · {medication.duration}</p>
                </div>
              )) : <p className="p-4 text-sm text-muted-foreground">No medications attached.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
