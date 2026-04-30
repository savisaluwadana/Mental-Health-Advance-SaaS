import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'How to Use MindBridge SL',
  description: 'A practical guide for clients and practitioners using MindBridge SL.',
}

const clientSteps = [
  {
    title: 'Create your account',
    text: 'Register as a client, sign in, and open your dashboard to manage care.',
  },
  {
    title: 'Book a session',
    text: 'Browse practitioners, filter by language, province, specialty, and session type, then request a time.',
  },
  {
    title: 'Join and follow up',
    text: 'Use your schedule for upcoming appointments, join online sessions, and message your practitioner when needed.',
  },
  {
    title: 'Track progress',
    text: 'Log mood, review goals, complete weekly check-ins, and view your progress dashboard.',
  },
]

const practitionerSteps = [
  'Review pending bookings and confirm suitable sessions.',
  'Add meeting links for online appointments.',
  'Use client profiles to review care activity.',
  'Write private session notes after appointments.',
  'Create prescriptions if you are registered as a psychiatrist.',
]

const adminOperations = [
  {
    title: 'Platform overview',
    text: 'Review total users, pending practitioner validations, and active safety keywords from the admin home screen.',
  },
  {
    title: 'User management',
    text: 'Search accounts, filter by role, approve practitioners, revoke verification, or delete users when required.',
  },
  {
    title: 'Safety engine',
    text: 'Add, review, and remove high-risk trigger phrases that help flag urgent client messages for practitioner attention.',
  },
  {
    title: 'Operational checks',
    text: 'Regularly review new registrations, practitioner details, SLMC numbers, and safety configuration.',
  },
]

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="pt-16">
        <section className="border-b border-brand-100 bg-brand-50 py-12 dark:border-brand-900/30 dark:bg-brand-950/20 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">User guide</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">How to Use MindBridge SL</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A practical guide for booking care, joining sessions, messaging practitioners, tracking progress, and managing appointments.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/therapists" className="btn-primary">Find a Therapist</Link>
              <Link href="/resources" className="btn-secondary">View Resources</Link>
              <Link href="/resources#blog" className="btn-secondary">Read Blog</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-4">
            {clientSteps.map((step, index) => (
              <div key={step.title} className="card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-4 text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="card p-6">
              <h2 className="text-2xl font-bold">For Clients</h2>
              <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground">
                <p>
                  After signing in, your dashboard shows your next sessions, today&apos;s mood prompt, active goals, and messages.
                  Use this area as your main home for care.
                </p>
                <p>
                  Online session links appear after the practitioner confirms the appointment and adds the link. The Join button becomes available close to the scheduled start time.
                </p>
                <p>
                  Mood entries and notes help you notice patterns. You can choose whether to share mood information with your practitioner.
                </p>
              </div>
            </div>

            <div className="card p-6 border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/10">
              <h2 className="text-2xl font-bold">For Practitioners</h2>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {practitionerSteps.map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-5">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Admin dashboard</p>
              <h2 className="text-2xl font-bold">Operations for Admins</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Admins keep the platform organized by managing users, practitioner verification, and safety settings.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {adminOperations.map((operation) => (
                <div key={operation.title} className="card p-5">
                  <h3 className="font-semibold">{operation.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{operation.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Crisis Support</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              MindBridge messages are not an emergency service. If you or someone else is in immediate danger, call local emergency services or use a crisis helpline.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="tel:1926" className="btn-primary bg-red-600 hover:bg-red-700">Call 1926</a>
              <a href="tel:1333" className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20">
                Call 1333
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
