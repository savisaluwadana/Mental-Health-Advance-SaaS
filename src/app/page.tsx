import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'
import { PractitionerDirectory } from '@/components/PractitionerDirectory'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MindBridge SL — Mental Health Platform for Sri Lanka',
  description: 'Connecting Sri Lankans and expats with licensed therapists and psychiatrists — island-wide access to mental health care.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-background to-background dark:from-brand-950/20 dark:via-background" />
          <div className="absolute top-20 right-0 h-[600px] w-[600px] -translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-brand-300/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-700/30 dark:bg-brand-900/20 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
              Now serving all 9 provinces of Sri Lanka
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-foreground md:text-6xl lg:text-7xl">
              Your mental health{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                matters here
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl leading-relaxed">
              MindBridge SL connects Sri Lankans and expats with licensed therapists and psychiatrists —
              in Sinhala, Tamil, and English. Wherever you are on the island, support is a click away.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#therapists" className="btn-primary text-base px-6 py-3">
                Find a Therapist
              </Link>
              <Link href="#how-it-works" className="btn-secondary text-base px-6 py-3">
                How It Works
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 text-sm text-muted-foreground">
              {[
                { label: 'Licensed Practitioners', value: '50+' },
                { label: 'Provinces Covered', value: '9 / 9' },
                { label: 'Languages', value: '3' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How MindBridge Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Getting mental health support in Sri Lanka has never been simpler.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse',
                description: 'Search our directory of licensed psychologists and psychiatrists. Filter by province, language, specialty, and session type.',
                icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
              },
              {
                step: '02',
                title: 'Book',
                description: 'Select a time slot that works for you — online video call or in-person. No waiting rooms, no paperwork.',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
              {
                step: '03',
                title: 'Begin',
                description: 'Connect with your therapist, track your mood, set goals, and grow. All your progress in one private, secure space.',
                icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
              },
            ].map((item, idx) => (
              <div key={idx} className="card p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-4 right-4 text-6xl font-black text-brand-500/10 group-hover:text-brand-500/15 transition-colors select-none">
                  {item.step}
                </div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapist Directory — live client component with filter state */}
      <section id="therapists" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Find Your Therapist</h2>
            <p className="mt-3 text-muted-foreground">Browse our network of licensed practitioners across Sri Lanka.</p>
          </div>
          <PractitionerDirectory />
        </div>
      </section>

      {/* Crisis Resources Banner */}
      <section className="py-8 bg-red-50 dark:bg-red-950/20 border-y border-red-100 dark:border-red-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🆘</span>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">In a crisis? Help is available 24/7</p>
              <p className="text-sm text-red-600 dark:text-red-400">Sri Lanka national mental health crisis lines</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="tel:1926" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
              📞 1926 — Ministry of Health
            </a>
            <a href="tel:1333" className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors dark:border-red-700 dark:text-red-400">
              📞 1333 — CCCline
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Is MindBridge SL available across Sri Lanka?',
                a: 'Yes — our platform connects clients in all 9 provinces with practitioners. Online sessions are available island-wide and to Sri Lankan expats abroad.'
              },
              {
                q: 'What languages are sessions available in?',
                a: 'Sessions are available in Sinhala, Tamil, and English. You can filter practitioners by language when searching.'
              },
              {
                q: 'Can I see a psychiatrist on the platform?',
                a: 'Yes. Our psychiatrists hold valid SLMC registration numbers displayed on their profiles. They can issue digital prescriptions through the platform.'
              },
              {
                q: 'Is my information private?',
                a: "Absolutely. Session notes are private to your practitioner. Mood entries are only shared with your therapist if you explicitly choose to share them. All data is encrypted in transit and at rest."
              },
              {
                q: 'How do I cancel or reschedule a session?',
                a: "You can cancel a session up to 24 hours before it's scheduled. Rescheduling can be done by messaging your practitioner through the platform."
              },
            ].map((item, idx) => (
              <details key={idx} className="card group">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium list-none">
                  {item.q}
                  <svg className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-bold">MindBridge SL</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Mental health support for every province, every language, every journey.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link></li>
                <li><Link href="/#therapists" className="hover:text-foreground transition-colors">Find a Therapist</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Crisis Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="tel:1926" className="hover:text-foreground transition-colors">1926 — Ministry of Health</a></li>
                <li><a href="tel:1333" className="hover:text-foreground transition-colors">1333 — CCCline</a></li>
                <li><a href="https://www.sumithrayo.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Sumithrayo</a></li>
                <li><a href="https://kalyanasl.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Kalyana SL</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MindBridge SL. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-foreground transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-foreground transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
