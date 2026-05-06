import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindBridge SL SaaS',
  description: 'Refactored mental health SaaS platform with Next.js, NestJS, and PostgreSQL.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
