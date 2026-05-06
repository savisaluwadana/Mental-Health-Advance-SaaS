import { crisisResources } from '@mindbridge/shared'
import { AuthPanel } from '../components/AuthPanel'
import { PractitionerDirectory } from '../components/PractitionerDirectory'
import { getPractitioners } from '../lib/api'

export default async function HomePage() {
  const { practitioners } = await getPractitioners().catch(() => ({ practitioners: [] }))

  return (
    <main>
      <section className="shell grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex rounded-full border border-lagoon/10 bg-white/70 px-4 py-2 text-sm font-black text-lagoon">
            Sri Lanka-first mental health SaaS, refactored for scale
          </div>
          <h1 className="mt-8 font-display text-6xl font-black leading-[0.95] text-lagoon md:text-7xl">
            Care coordination that feels human before it feels clinical.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            MindBridge connects clients with verified psychologists, psychiatrists, and counsellors while giving care
            teams secure tools for sessions, mood tracking, goals, safety alerts, and prescription workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#directory" className="button-primary">
              Browse Practitioners
            </a>
            <a href="/dashboard" className="button-soft">
              Open Dashboard
            </a>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {['Postgres Clinical Core', 'NestJS RBAC API', 'Next.js Care Console'].map((item) => (
              <div key={item} className="panel p-4 text-sm font-black text-lagoon">
                {item}
              </div>
            ))}
          </div>
        </div>
        <AuthPanel />
      </section>

      <section className="border-y border-red-200/60 bg-red-50/80 py-6">
        <div className="shell flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-black text-red-800">In crisis or immediate danger?</p>
            <p className="text-sm text-red-700">This platform is not an emergency service. Use 24/7 help now.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {crisisResources.map((resource) => (
              <a key={resource.value} href={resource.href} className="rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white">
                {resource.label}: {resource.value}
              </a>
            ))}
          </div>
        </div>
      </section>

      <PractitionerDirectory initialPractitioners={practitioners} />
    </main>
  )
}
