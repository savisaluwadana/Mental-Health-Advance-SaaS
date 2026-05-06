'use client'

import type { PractitionerCard } from '@mindbridge/shared'
import { useState } from 'react'
import { getPractitioners } from '../lib/api'

export function PractitionerDirectory({ initialPractitioners }: { initialPractitioners: PractitionerCard[] }) {
  const [search, setSearch] = useState('')
  const [practitioners, setPractitioners] = useState(initialPractitioners)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    setLoading(true)
    try {
      const result = await getPractitioners(search)
      setPractitioners(result.practitioners)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="shell py-16" id="directory">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-reef">Verified Network</p>
          <h2 className="mt-2 font-display text-4xl font-black text-lagoon">Find your clinical match</h2>
        </div>
        <div className="flex w-full max-w-xl gap-3">
          <input
            className="input"
            placeholder="Search anxiety, Tamil, psychiatrist..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="button-primary whitespace-nowrap" onClick={handleSearch}>
            {loading ? 'Searching' : 'Search'}
          </button>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {practitioners.map((practitioner) => (
          <article key={practitioner.id} className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="badge">{practitioner.role}</span>
              <span className="text-xs font-bold text-reef">{practitioner.verified ? 'Verified' : 'Pending'}</span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-black text-lagoon">{practitioner.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{practitioner.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(practitioner.languages ?? []).map((language) => (
                <span key={language} className="badge">
                  {language}
                </span>
              ))}
              {practitioner.province ? <span className="badge">{practitioner.province}</span> : null}
            </div>
            <p className="mt-5 text-sm font-bold text-azure">{practitioner.specialty}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
