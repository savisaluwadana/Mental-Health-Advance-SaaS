import type { Metadata } from 'next'
import { Abhaya_Libre, Arima, Caveat, Lato, Libre_Baskerville } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/SessionProvider'
import { Toaster } from 'sonner'
import { GoogleTranslateInit } from '@/components/GoogleTranslate'
import { LanguagePickerModal } from '@/components/LanguagePickerModal'
import { authOptions } from '@/lib/auth'
import './globals.css'

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caveat',
  display: 'swap',
})

const abhayaLibre = Abhaya_Libre({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-abhaya-libre',
  display: 'swap',
})

const arima = Arima({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-arima',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lato.variable} ${libreBaskerville.variable} ${caveat.variable} ${abhayaLibre.variable} ${arima.variable}`}
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
            <LanguagePickerModal />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
