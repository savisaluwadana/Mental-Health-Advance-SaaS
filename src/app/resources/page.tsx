import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Mental Health Resources',
  description: 'Free mental health resources, crisis lines, and support services for Sri Lankans and expats.',
}

const ARTICLES = [
  { category: 'Anxiety', title: 'Understanding Anxiety Disorders', desc: 'Learn to identify anxiety symptoms and evidence-based coping strategies.', marker: 'AN' },
  { category: 'Depression', title: 'Living with Depression', desc: 'What depression really feels like and how treatment can help.', marker: 'DP' },
  { category: 'Relationships', title: 'Healthy Communication in Relationships', desc: 'Building stronger bonds through empathy and active listening.', marker: 'RL' },
  { category: 'Work Stress', title: 'Preventing Burnout', desc: 'Recognizing early warning signs and practical strategies to recover.', marker: 'WS' },
  { category: 'Anxiety', title: 'Mindfulness for Everyday Anxiety', desc: 'Simple 5-minute practices you can do anywhere to reduce stress.', marker: 'MF' },
  { category: 'Depression', title: 'When to Seek Professional Help', desc: 'Signs that it\'s time to talk to a licensed therapist or psychiatrist.', marker: 'CH' },
]

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Relationships', 'Work Stress']

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

          {/* Articles */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Articles & Guides</h2>
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
                  <p className="text-xs text-brand-600 mt-3 font-medium">Read article →</p>
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
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8 dark:border-brand-900/30 dark:bg-brand-950/20">
              <h2 className="text-2xl font-bold">Platform Documentation</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                A technical overview of MindBridge SL — architecture, security, and the core modules powering care.
              </p>
            </div>

            <div className="mt-8 prose dark:prose-invert prose-brand max-w-none">
              <h3>1. Architecture Overview</h3>
              <p>
                The platform is built on modern web technologies ensuring speed, scalability, and real-time responsiveness across all 9 provinces in Sri Lanka.
              </p>
              <ul>
                <li><strong>Frontend &amp; Backend:</strong> Next.js 14 (App Router)</li>
                <li><strong>Database:</strong> MongoDB (Mongoose)</li>
                <li><strong>Real-time Layer:</strong> Custom Node.js server with Socket.io</li>
                <li><strong>Authentication:</strong> NextAuth.js (JWT, role-based)</li>
                <li><strong>PDF Generation:</strong> @react-pdf/renderer (Server-side streaming)</li>
              </ul>

              <hr className="my-8" />

              <h3>2. Role-Based Access Control (RBAC)</h3>
              <p>
                The system operates on three primary roles, rigidly enforced by NextAuth JWT claims and Next.js Middleware:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 not-prose">
                <div className="card p-5">
                  <h4 className="font-bold text-lg mb-2">Client</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Books sessions</li>
                    <li>• Tracks daily mood &amp; goals</li>
                    <li>• Messages practitioners</li>
                  </ul>
                </div>
                <div className="card p-5 border-brand-200 dark:border-brand-800">
                  <h4 className="font-bold text-lg mb-2">Psychologist</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manages client roster</li>
                    <li>• Writes private session notes</li>
                    <li>• Cannot issue prescriptions</li>
                  </ul>
                </div>
                <div className="card p-5 border-brand-500 bg-brand-50 dark:bg-brand-900/10">
                  <h4 className="font-bold text-lg mb-2">Psychiatrist</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All psychologist permissions</li>
                    <li>• Requires SLMC Reg No.</li>
                    <li>• <strong>Can issue digital prescriptions</strong></li>
                  </ul>
                </div>
              </div>

              <hr className="my-8" />

              <h3>3. Real-Time Secure Messaging &amp; Safety Alerts</h3>
              <p>
                Given the sensitive nature of mental health text-based therapy, the messaging infrastructure prioritizes immediate safety intervention.
              </p>
              <ul>
                <li><strong>Socket.io Integration:</strong> Ensures instant delivery without page reloads.</li>
                <li><strong>Keyword Engine:</strong> Every message is scanned server-side against a configurable list of high-risk keywords.</li>
                <li><strong>Instant Practitioner Alerts:</strong> If a keyword triggers, an urgent alert is pushed to the practitioner's dashboard.</li>
                <li><strong>Rate Limiting:</strong> Spam protection limits messages and alert notifications to prevent fatigue.</li>
              </ul>

              <hr className="my-8" />

              <h3>4. Legal &amp; Compliance: Digital Prescriptions</h3>
              <p>
                The Prescription Module is explicitly locked to the <code>psychiatrist</code> role. It implements a zero-persistence architecture for maximum privacy.
              </p>
              <ul>
                <li><strong>Signatures &amp; Seals:</strong> Stored as Base64 strings in MongoDB.</li>
                <li><strong>No Cloud Storage:</strong> External file storage is avoided in V1 to reduce data footprint.</li>
                <li><strong>On-Demand PDF Streaming:</strong> Generated in memory and streamed with <code>Cache-Control: no-store</code>.</li>
              </ul>

              <hr className="my-8" />

              <h3>5. Client Progress &amp; Analytics</h3>
              <p>
                Clients have access to a dedicated Progress Dashboard combining three metrics:
              </p>
              <ol>
                <li><strong>Mood Tracking:</strong> One-per-day mood scores plotted on 30/90-day trendlines.</li>
                <li><strong>Goal Completion:</strong> Weekly goals tracked via a completion rate visualizer.</li>
                <li><strong>Session History:</strong> Complete log of scheduling metadata.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
