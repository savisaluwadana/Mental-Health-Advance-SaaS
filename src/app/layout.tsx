import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/SessionProvider'
import { Toaster } from 'sonner'
import { GoogleTranslateInit } from '@/components/GoogleTranslate'
import { LanguagePickerModal } from '@/components/LanguagePickerModal'
import { authOptions } from '@/lib/auth'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MindBridge SL — Mental Health Platform for Sri Lanka',
    template: '%s | MindBridge SL',
  },
  description:
    'Connecting Sri Lankans with licensed therapists and psychiatrists. Book sessions, track your mood, and access mental health resources — island-wide and for expats.',
  keywords: ['mental health', 'therapy', 'Sri Lanka', 'counselling', 'psychiatry', 'mindbridge'],
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'MindBridge SL',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
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
            <LanguagePickerModal />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
