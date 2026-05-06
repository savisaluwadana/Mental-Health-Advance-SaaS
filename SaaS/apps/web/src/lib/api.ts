import type { AuthUser, PractitionerCard } from '@mindbridge/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message ?? 'Request failed')
  }

  return response.json() as Promise<T>
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(payload: {
  name: string
  email: string
  password: string
  role: string
  province?: string
  languages?: string[]
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPractitioners(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<{ practitioners: PractitionerCard[] }>(`/practitioners${query}`, {
    next: { revalidate: 60 },
  })
}

export function getArticles() {
  return apiFetch<{ articles: Array<{ id: string; title: string; category: string; desc: string; readTime: string; marker: string }> }>(
    '/articles',
    { next: { revalidate: 60 } },
  )
}
