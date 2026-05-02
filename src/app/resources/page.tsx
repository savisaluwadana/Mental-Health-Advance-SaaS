import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Mental Health Resources',
  description: 'Free mental health resources, crisis lines, and support services for Sri Lankans and expats.',
}

const ARTICLES = [
  { category: 'Anxiety', title: 'Understanding Anxiety Disorders', desc: 'Learn to identify anxiety symptoms and evidence-based coping strategies.', marker: 'AN', readTime: '6 min read' },
  { category: 'Depression', title: 'Living with Depression', desc: 'What depression really feels like and how treatment can help.', marker: 'DP', readTime: '7 min read' },
  { category: 'Relationships', title: 'Healthy Communication in Relationships', desc: 'Building stronger bonds through empathy and active listening.', marker: 'RL', readTime: '5 min read' },
  { category: 'Work Stress', title: 'Preventing Burnout', desc: 'Recognizing early warning signs and practical strategies to recover.', marker: 'WS', readTime: '6 min read' },
  { category: 'Anxiety', title: 'Mindfulness for Everyday Anxiety', desc: 'Simple 5-minute practices you can do anywhere to reduce stress.', marker: 'MF', readTime: '4 min read' },
  { category: 'Depression', title: 'When to Seek Professional Help', desc: 'Signs that it\'s time to talk to a licensed therapist or psychiatrist.', marker: 'CH', readTime: '5 min read' },
]

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

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-brand-50 dark:bg-brand-950/20 py-12 sm:py-16 border-b border-brand-100 dark:border-brand-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Mental Health Resources</h1>
            <p className="text-muted-foreground max-w-xl">
              Curated articles, crisis helplines, and support services. All freely accessible to anyone in Sri Lanka.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Crisis Lines */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>Crisis Lines — Available 24/7</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Ministry of Health', number: '1926', desc: 'National mental health helpline', color: 'red' },
                { name: 'CCCline', number: '1333', desc: 'Counselling & mental health support', color: 'red' },
                { name: 'Sumithrayo', number: '+94 11 269 6666', desc: 'Emotional support & crisis intervention', color: 'orange', href: 'https://www.sumithrayo.org' },
                { name: 'Kalyana SL', number: '+94 11 455 0006', desc: 'Mental health awareness & support', color: 'orange', href: 'https://kalyanasl.org' },
              ].map((line) => (
                <a key={line.name}
                  href={line.href || `tel:${line.number}`}
                  className="card p-5 hover:shadow-md transition-shadow border-red-100 dark:border-red-900/20 group"
                  target={line.href ? '_blank' : undefined} rel={line.href ? 'noopener noreferrer' : undefined}>
                  <p className="text-2xl font-bold text-red-600 group-hover:text-red-700">{line.number}</p>
                  <p className="font-semibold mt-1">{line.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{line.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* Blog */}
          <section id="blog">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Blog</p>
                <h2 className="text-2xl font-bold">Articles & Guides</h2>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                Practical reading for clients, families, and practitioners. Use these articles as educational support, not as a replacement for professional care.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ARTICLES.map((article, i) => (
                <div key={i} className="card p-5 hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{article.marker}</span>
                    <div>
                      <span className="badge badge-green text-xs mb-1">{article.category}</span>
                      <h3 className="font-semibold leading-snug group-hover:text-brand-600 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{article.desc}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">{article.readTime}</span>
                    <span className="font-medium text-brand-600 dark:text-brand-300">Read article →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* External links */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Sri Lanka Mental Health Organizations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Sumithrayo', url: 'https://www.sumithrayo.org', desc: 'Sri Lanka\'s leading suicide prevention & emotional support organization.' },
                { name: 'Kalyana SL', url: 'https://kalyanasl.org', desc: 'Community mental health awareness campaigns and support programs.' },
                { name: 'National Institute of Mental Health (NIMH)', url: 'https://nimh.health.gov.lk', desc: 'Government institute for mental health research and care in Sri Lanka.' },
                { name: 'Ministry of Health – Mental Health Unit', url: 'https://www.health.gov.lk', desc: 'Official government mental health resources and services.' },
              ].map((org) => (
                <a key={org.name} href={org.url} target="_blank" rel="noopener noreferrer"
                  className="card p-5 hover:shadow-md transition-shadow flex items-start gap-3 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-brand-600 transition-colors">{org.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{org.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Documentation */}
          <section id="documentation" className="mt-16">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8 dark:border-brand-900/30 dark:bg-brand-950/20 mb-8">
              <h2 className="text-2xl font-bold">How to Use MindBridge SL</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Simple guidance for clients, practitioners, and families using the platform for mental health support.
              </p>
            </div>

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
                    After signing in, your dashboard shows your next sessions, today's mood prompt, active goals, and messages.
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
          </section>
        </div>
      </div>
    </div>
  )
}
