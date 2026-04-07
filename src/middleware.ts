import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect authenticated users away from auth pages
    if (token && (pathname === '/login' || pathname === '/register')) {
      const role = token.role as string
      if (role === 'client') return NextResponse.redirect(new URL('/dashboard/client', req.url))
      if (role === 'psychologist' || role === 'psychiatrist')
        return NextResponse.redirect(new URL('/dashboard/practitioner', req.url))
      if (role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    }

    // Client-only dashboard
    if (pathname.startsWith('/dashboard/client') && token?.role !== 'client') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Practitioner-only dashboard
    if (
      pathname.startsWith('/dashboard/practitioner') &&
      token?.role !== 'psychologist' &&
      token?.role !== 'psychiatrist'
    ) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Prescription routes — psychiatrist only
    if (
      (pathname.startsWith('/dashboard/practitioner/prescriptions') ||
        pathname.startsWith('/api/prescriptions')) &&
      token?.role !== 'psychiatrist'
    ) {
      return NextResponse.json({ error: 'Forbidden: Psychiatrist access only' }, { status: 403 })
    }

    // Admin-only
    if (pathname.startsWith('/dashboard/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/resources') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/practitioners')
        ) {
          return true
        }
        // All other routes require auth
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/sessions/:path*',
    '/api/mood/:path*',
    '/api/goals/:path*',
    '/api/messages/:path*',
    '/api/prescriptions/:path*',
    '/api/users/:path*',
    '/api/admin/:path*',
    '/login',
    '/register',
  ],
}
