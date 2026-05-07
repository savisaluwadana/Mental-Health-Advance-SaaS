'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { AnimatedStats } from './AnimatedStats'

const needs = [
  {
    label: 'Anxiety',
    specialty: 'Clinical Psychologist',
    tone: 'Grounding plan',
    detail: 'Breathing tools, weekly check-ins, and private progress tracking.',
  },
  {
    label: 'Depression',
    specialty: 'Counsellor',
    tone: 'Steady support',
    detail: 'Goal setting, mood logs, and secure follow-up between sessions.',
  },
  {
    label: 'Stress',
    specialty: 'Psychologist',
    tone: 'Work-life reset',
    detail: 'Practical coping routines for students, teams, and families.',
  },
  {
    label: 'Medication',
    specialty: 'Psychiatrist',
    tone: 'Prescription care',
    detail: 'SLMC-verified review, digital prescriptions, and session notes.',
  },
]

const provinces = ['Western', 'Central', 'Southern', 'Northern', 'Eastern']

export function HeroExperience() {
  const router = useRouter()
  const [selectedNeed, setSelectedNeed] = useState(needs[0])
  const [selectedProvince, setSelectedProvince] = useState(provinces[0])
  const [sessionType, setSessionType] = useState<'online' | 'in-person'>('online')
  const [query, setQuery] = useState('')

  const matchScore = useMemo(() => {
    const provinceBoost = provinces.indexOf(selectedProvince) * 2
    const queryBoost = query.trim().length > 2 ? 4 : 0
    return Math.min(98, 88 + provinceBoost + queryBoost)
  }, [query, selectedProvince])

  const searchTarget = useMemo(() => {
    const params = new URLSearchParams()
    const searchText = query.trim() || selectedNeed.label
    if (searchText) params.set('search', searchText)
    params.set('need', selectedNeed.label.toLowerCase())
    params.set('province', selectedProvince)
    params.set('type', sessionType === 'in-person' ? 'physical' : 'online')
    return `/therapists?${params.toString()}#directory`
  }, [query, selectedNeed, selectedProvince, sessionType])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(searchTarget)
  }

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F0FBF9_0%,#ffffff_44%,#E9F8FF_72%,#D7F1EA_100%)] dark:bg-[linear-gradient(135deg,#0F0F0F_0%,#16201f_48%,#003862_100%)]" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="absolute right-8 top-28 hidden h-52 w-52 rounded-full bg-blue-300/20 blur-3xl lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm shadow-brand-950/5 backdrop-blur dark:border-brand-700/30 dark:bg-white/10 dark:text-brand-300">
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              Sri Lanka's verified mental health network
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              SafeSpace{' '}
              <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">
                Lanka
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              Private support from verified psychologists, psychiatrists, and counsellors. Book online or in person,
              track your progress, and keep every step of your care in one secure platform.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 rounded-2xl border border-brand-100 bg-card/95 p-4 shadow-2xl shadow-brand-950/10 backdrop-blur dark:border-white/10"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="text"
                  placeholder="City, province, or specialty"
                  className="input-field"
                  aria-label="Search by city, province, or specialty"
                />
                <button
                  type="submit"
                  className="btn-primary px-5"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {needs.map((need) => {
                  const active = selectedNeed.label === need.label
                  return (
                    <button
                      key={need.label}
                      type="button"
                      onClick={() => setSelectedNeed(need)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                        active
                          ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-800/20'
                          : 'border-brand-200 bg-brand-50 text-brand-700 hover:-translate-y-0.5 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300'
                      }`}
                    >
                      {need.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Province</span>
                  <select
                    className="input-field"
                    value={selectedProvince}
                    onChange={(event) => setSelectedProvince(event.target.value)}
                  >
                    {provinces.map((province) => (
                      <option key={province}>{province}</option>
                    ))}
                  </select>
                </label>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Session type</span>
                  <div className="grid h-11 grid-cols-2 rounded-lg border border-input bg-background/90 p-1">
                    {(['online', 'in-person'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSessionType(type)}
                        className={`rounded-md text-sm font-semibold capitalize transition ${
                          sessionType === type ? 'bg-brand-800 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">I need support with</span>{' '}
              <span className="font-semibold text-brand-600">{selectedNeed.label.toLowerCase()}</span>
              <span className="ml-1 inline-block h-4 w-[2px] align-middle bg-brand-600 animate-pulse" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link href={searchTarget} className="btn-primary px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base">
                Match With a Specialist
              </Link>
              <Link href="#how-it-works" className="btn-secondary px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base">
                See the Experience
              </Link>
            </div>

            <AnimatedStats />
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] border border-brand-100/80 bg-white/50 shadow-2xl shadow-brand-950/10 dark:border-white/10 dark:bg-white/5" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/50 bg-[#093f45] p-4 text-white shadow-2xl shadow-brand-950/20 dark:border-white/10">
              <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-brand-400/30 blur-3xl" />
              <div className="absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl" />

              <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">Live Match Preview</p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">A calmer route to care</h2>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-right text-brand-800">
                    <p className="text-xs font-semibold">Match</p>
                    <p className="text-xl font-black">{matchScore}%</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                    <div className="mx-auto mb-4 h-24 w-24 rounded-full border border-white/25 bg-[radial-gradient(circle_at_35%_35%,#ffffff_0%,#d7f1ea_20%,#51b291_55%,#003862_100%)] shadow-lg shadow-black/20 animate-float" />
                    <p className="text-center text-sm font-semibold">{selectedNeed.specialty}</p>
                    <p className="mt-1 text-center text-xs text-white/70">{selectedProvince} Province</p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                      <p className="text-sm font-semibold">{selectedNeed.tone}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">{selectedNeed.detail}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {['Verified', sessionType === 'online' ? 'Video' : 'Clinic', 'Private'].map((item) => (
                        <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-2 font-semibold">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Available this week</p>
                    <span className="rounded-full bg-brand-300/20 px-2 py-1 text-xs font-semibold text-brand-100">
                      {sessionType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Today 6:30', 'Fri 9:00', 'Sun 4:15'].map((slot, index) => (
                      <button
                        key={slot}
                        type="button"
                        className={`rounded-lg border p-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
                          index === 0 ? 'border-brand-200 bg-brand-200 text-brand-900' : 'border-white/15 bg-white/10 text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
