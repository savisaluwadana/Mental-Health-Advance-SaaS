// Extend next-auth types to include id and role
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
    accessToken?: string
  }

  interface User {
    role: string
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email?: string | null
    name?: string | null
    role: string
    accessToken?: string
  }
}
