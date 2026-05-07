import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/SessionProvider'
import { Toaster } from 'sonner'
import { GoogleTranslateInit } from '@/components/GoogleTranslate'
import { authOptions } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SafeSpace Lanka — Mental Health Platform for Sri Lanka',
    template: '%s | SafeSpace Lanka',
  },
  description:
    'Connecting Sri Lankans with licensed therapists and psychiatrists. Book sessions, track your mood, and access mental health resources — island-wide and for expats.',
  keywords: ['mental health', 'therapy', 'Sri Lanka', 'counselling', 'psychiatry', 'safespace lanka'],
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'SafeSpace Lanka',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider session={session}>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
            <GoogleTranslateInit />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
