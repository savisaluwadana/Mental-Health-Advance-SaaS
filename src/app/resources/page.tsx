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
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 sm:p-8 dark:border-brand-900/30 dark:bg-brand-950/20">
              <h2 className="text-2xl font-bold">How to Use MindBridge SL</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Simple guidance for clients, practitioners, and families using the platform for mental health support.
              </p>
            </div>

            <div className="mt-8 prose dark:prose-invert prose-brand max-w-none">
              <h3>1. Create Your Account</h3>
              <p>
                Start by creating an account and choosing the role that matches how you will use MindBridge SL.
              </p>
              <ul>
                <li><strong>Clients</strong> can book sessions, message practitioners, track mood, and follow goals.</li>
                <li><strong>Psychologists</strong> can manage clients, sessions, messages, and private notes.</li>
                <li><strong>Psychiatrists</strong> can do everything psychologists can do and issue prescriptions when appropriate.</li>
              </ul>

              <hr className="my-8" />

              <h3>2. Find and Book a Therapist</h3>
              <p>
                Use the therapist directory to find a practitioner who fits your needs.
              </p>
              <ol>
                <li>Open <strong>Find a Therapist</strong>.</li>
                <li>Filter by province, language, session type, specialty, or practitioner type.</li>
                <li>Select a practitioner and choose a date, time, and online or in-person session.</li>
                <li>Submit the booking request and wait for confirmation from the practitioner.</li>
              </ol>

              <hr className="my-8" />

              <h3>3. Join Online Sessions</h3>
              <p>
                Online sessions appear in your dashboard after they are booked. When the practitioner confirms the session, they can add the meeting link.
              </p>
              <ul>
                <li>The <strong>Join</strong> button becomes available close to the session start time.</li>
                <li>You can join from your browser if the meeting provider allows it.</li>
                <li>If you cannot see a link, message your practitioner or check whether the session is still pending.</li>
              </ul>

              <hr className="my-8" />

              <h3>4. Message Your Practitioner</h3>
              <p>
                Use Messages for appointment questions, follow-ups, and care-related updates between sessions. Messages are intended for ongoing support, not emergency response.
              </p>
              <ul>
                <li>Open your dashboard and go to <strong>Messages</strong>.</li>
                <li>Write your message and send it to your assigned practitioner.</li>
                <li>For immediate danger or crisis support, use the crisis helplines listed above.</li>
              </ul>

              <hr className="my-8" />

              <h3>5. Track Mood, Goals, and Progress</h3>
              <p>
                Your dashboard helps you keep a simple record of how you are doing over time.
              </p>
              <ul>
                <li><strong>Mood Tracker:</strong> Log one mood score per day, add emotion tags, and optionally share it with your practitioner.</li>
                <li><strong>Goals:</strong> Review goals set by your practitioner and submit weekly check-ins.</li>
                <li><strong>Progress:</strong> View your mood history, goal completion, and session activity in one place.</li>
              </ul>

              <hr className="my-8" />

              <h3>6. Prescriptions</h3>
              <p>
                Prescriptions can only be issued by psychiatrists. If your psychiatrist creates one for you, you can download the PDF from the prescription area when it is available.
              </p>
              <p>
                Always follow your psychiatrist's instructions and speak to a registered pharmacist or doctor if anything is unclear.
              </p>

              <hr className="my-8" />

              <h3>7. Practitioner Workflow</h3>
              <p>
                Practitioners use their dashboard to manage care in one place.
              </p>
              <ul>
                <li><strong>Schedule:</strong> Review pending bookings, confirm sessions, and manage upcoming appointments.</li>
                <li><strong>Online Sessions:</strong> Add Google Meet or Microsoft Teams links for confirmed online sessions.</li>
                <li><strong>Clients:</strong> View assigned clients and their care activity.</li>
                <li><strong>Notes:</strong> Keep private session notes for clinical reference.</li>
                <li><strong>Prescriptions:</strong> Psychiatrists can create and download digital prescriptions.</li>
              </ul>

              <hr className="my-8" />

              <h3>8. Admin Dashboard Operations</h3>
              <p>
                Admins use the dashboard to keep the platform organized, moderated, and ready for safe use.
              </p>
              <ul>
                <li><strong>Overview:</strong> Review total users, pending practitioner validations, and active safety keywords.</li>
                <li><strong>User Management:</strong> Search users, filter by role, approve or revoke practitioner verification, and remove accounts when required.</li>
                <li><strong>Practitioner Verification:</strong> Check practitioner details such as role and SLMC number before approving access.</li>
                <li><strong>Safety Engine:</strong> Add, review, and remove high-risk trigger phrases used to flag urgent messages.</li>
                <li><strong>Operational Review:</strong> Use the dashboard regularly to monitor registrations and keep care access trustworthy.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
