import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Mental Health Resources',
  description: 'Free mental health resources, crisis lines, and support services for Sri Lankans and expats.',
}

const ARTICLES = [
  { category: 'Anxiety', title: 'Understanding Anxiety Disorders', desc: 'Learn to identify anxiety symptoms and evidence-based coping strategies.', emoji: '😰' },
  { category: 'Depression', title: 'Living with Depression', desc: 'What depression really feels like and how treatment can help.', emoji: '💙' },
  { category: 'Relationships', title: 'Healthy Communication in Relationships', desc: 'Building stronger bonds through empathy and active listening.', emoji: '💬' },
  { category: 'Work Stress', title: 'Preventing Burnout', desc: 'Recognizing early warning signs and practical strategies to recover.', emoji: '🔋' },
  { category: 'Anxiety', title: 'Mindfulness for Everyday Anxiety', desc: 'Simple 5-minute practices you can do anywhere to reduce stress.', emoji: '🧘' },
  { category: 'Depression', title: 'When to Seek Professional Help', desc: 'Signs that it\'s time to talk to a licensed therapist or psychiatrist.', emoji: '🏥' },
]

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Relationships', 'Work Stress']

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-brand-50 dark:bg-brand-950/20 py-16 border-b border-brand-100 dark:border-brand-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold mb-3">Mental Health Resources</h1>
            <p className="text-muted-foreground max-w-xl">
              Curated articles, crisis helplines, and support services. All freely accessible to anyone in Sri Lanka.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Crisis Lines */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              🆘 <span>Crisis Lines — Available 24/7</span>
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
                    <span className="text-3xl">{article.emoji}</span>
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
        </div>
      </div>
    </div>
  )
}
