import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'
import { PractitionerDirectory } from '@/components/PractitionerDirectory'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find a Therapist — MindBridge SL',
  description: 'Browse verified psychologists and psychiatrists in Sri Lanka. Filter by province, language, and session type.',
}

export default function TherapistsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="pt-16">
        <div className="bg-brand-50 dark:bg-brand-950/20 py-12 sm:py-16 border-b border-brand-100 dark:border-brand-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Find your specialist</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">Match with a verified therapist</h1>
              <p className="text-muted-foreground mt-3">
                Browse licensed practitioners across Sri Lanka and book the care you need.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#directory" className="btn-primary">Browse Specialists</Link>
                <Link href="/register" className="btn-secondary">Create an Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="directory" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Find Your Therapist</h2>
            <p className="mt-3 text-muted-foreground">Browse our network of licensed practitioners across Sri Lanka.</p>
          </div>
          <PractitionerDirectory />
        </div>
      </section>
    </div>
  )
}
