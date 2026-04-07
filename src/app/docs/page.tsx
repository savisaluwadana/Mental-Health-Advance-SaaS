import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Platform Documentation — MindBridge SL',
  description: 'Detailed documentation on the architecture, features, and security of the MindBridge SL mental health platform.',
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <div className="pt-16">
        <div className="bg-brand-50 dark:bg-brand-950/20 py-16 border-b border-brand-100 dark:border-brand-900/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold mb-3">MindBridge SL Documentation</h1>
            <p className="text-muted-foreground max-w-xl">
              A comprehensive technical overview of the V1 platform architecture, features, and security protocols.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert prose-brand max-w-none">
          
          <h2>1. Architecture Overview</h2>
          <p>
            The platform is built on modern web technologies ensuring speed, scalability, and real-time responsiveness across all 9 provinces in Sri Lanka.
          </p>
          <ul>
            <li><strong>Frontend & Backend:</strong> Next.js 14 (App Router)</li>
            <li><strong>Database:</strong> MongoDB (Mongoose)</li>
            <li><strong>Real-time Layer:</strong> Custom Node.js server with Socket.io</li>
            <li><strong>Authentication:</strong> NextAuth.js (JWT, role-based)</li>
            <li><strong>PDF Generation:</strong> @react-pdf/renderer (Server-side streaming)</li>
          </ul>

          <hr className="my-8" />

          <h2>2. Role-Based Access Control (RBAC)</h2>
          <p>
            The system operates on three primary roles, rigidly enforced by NextAuth JWT claims and Next.js Middleware:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 not-prose">
            <div className="card p-5">
              <h3 className="font-bold text-lg mb-2">Client</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Books sessions</li>
                <li>• Tracks daily mood & goals</li>
                <li>• Messages practitioners</li>
              </ul>
            </div>
            <div className="card p-5 border-brand-200 dark:border-brand-800">
              <h3 className="font-bold text-lg mb-2">Psychologist</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Manages client roster</li>
                <li>• Writes private session notes</li>
                <li>• Cannot issue prescriptions</li>
              </ul>
            </div>
            <div className="card p-5 border-brand-500 bg-brand-50 dark:bg-brand-900/10">
              <h3 className="font-bold text-lg mb-2">Psychiatrist</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All psychologist permissions</li>
                <li>• Requires SLMC Reg No.</li>
                <li>• <strong>Can issue digital prescriptions</strong></li>
              </ul>
            </div>
          </div>

          <hr className="my-8" />

          <h2>3. Real-Time Secure Messaging & Safety Alerts</h2>
          <p>
            Given the sensitive nature of mental health text-based therapy, the messaging infrastructure prioritizes immediate safety intervention.
          </p>
          <ul>
            <li><strong>Socket.io Integration:</strong> Ensures instant delivery without page reloads. Powered by a custom <code>server.js</code> wrapper.</li>
            <li><strong>Keyword Engine:</strong> Every message is scanned server-side against a configurable list of high-risk keywords (e.g., self-harm, suicide).</li>
            <li><strong>Instant Practitioner Alerts:</strong> If a keyword triggers, an urgent alert is pushed directly to the practitioner's dashboard inbox.</li>
            <li><strong>Rate Limiting:</strong> Spam protection prevents clients from sending &gt;5 messages per hour unprompted, while alert notifications are throttled to a maximum of 3 per hour per client to prevent practitioner fatigue.</li>
          </ul>

          <hr className="my-8" />

          <h2>4. Legal & Compliance: Digital Prescriptions</h2>
          <p>
            The Prescription Module is explicitly locked to the <code>psychiatrist</code> role. It implements a zero-persistence architecture for maximum privacy.
          </p>
          <ul>
            <li><strong>Signatures & Seals:</strong> Psychiatrists draw their signature using an HTML Canvas. Official seals are uploaded. Both are stored purely as Base64 strings in MongoDB.</li>
            <li><strong>No Cloud Storage:</strong> External file storage (like AWS S3) is strictly avoided in V1 to reduce data footprint.</li>
            <li><strong>On-Demand PDF Streaming:</strong> When a user downloads a prescription, the PDF is generated instantly in server memory using <code>@react-pdf</code> and streamed as binary data with <code>Cache-Control: no-store</code>. The file never touches the server's hard drive.</li>
          </ul>

          <hr className="my-8" />

          <h2>5. Client Progress & Analytics</h2>
          <p>
            Clients have access to a dedicated Progress Dashboard combining three metrics:
          </p>
          <ol>
            <li><strong>Mood Tracking:</strong> Idempotent (one-per-day) mood scores out of 10, plotted on a 30-day or 90-day Recharts trendline.</li>
            <li><strong>Goal Completion:</strong> Weekly actionable goals assigned by therapists, tracked via a completion rate visualizer.</li>
            <li><strong>Session History:</strong> Complete log of scheduling metadata (pending, confirmed, completed, cancelled).</li>
          </ol>

        </div>
      </div>
    </div>
  )
}
