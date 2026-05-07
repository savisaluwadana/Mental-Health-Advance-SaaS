import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

const pathMap: Record<string, string> = {
  register: 'auth/register',
  'messages/flags': 'messages/alerts',
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const incomingPath = context.params.path.join('/')
  const mappedPath = pathMap[incomingPath] ?? incomingPath
  const target = new URL(`${API_URL}/${mappedPath}`)
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value))

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const headers = new Headers()
  headers.set('content-type', request.headers.get('content-type') ?? 'application/json')
  if (typeof token?.accessToken === 'string') {
    headers.set('authorization', `Bearer ${token.accessToken}`)
  }

  const method = request.method
  const hasBody = !['GET', 'HEAD'].includes(method)
  const response = await fetch(target, {
    method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  })

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(normalizeError(data), { status: response.status })
    }
    return NextResponse.json(normalizeResponse(incomingPath, data), { status: response.status })
  }

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'content-type': contentType || 'text/plain' },
  })
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT }

function normalizeError(data: any) {
  const message = Array.isArray(data?.message)
    ? data.message.join(', ')
    : data?.message ?? data?.error ?? 'Request failed'

  return {
    error: message,
  }
}

function normalizeResponse(path: string, data: any): any {
  if (!data || typeof data !== 'object') return data

  if (path === 'sessions' && Array.isArray(data.sessions)) return data.sessions.map(normalizeSession)
  if (path.startsWith('sessions/') && data.session) return normalizeSession(data.session)
  if (path.startsWith('sessions/') && Array.isArray(data.note)) return data.note.map(normalizeDoc)
  if (path.startsWith('sessions/') && data.note) return normalizeDoc(data.note)

  if (path === 'goals' && Array.isArray(data.goals)) return data.goals.map(normalizeDoc)
  if (path === 'goals' && data.goal) return normalizeDoc(data.goal)

  if (path === 'mood' && Array.isArray(data.entries)) return data.entries.map(normalizeDoc)
  if (path === 'mood' && data.entry) return normalizeDoc(data.entry)

  if (path === 'messages' && Array.isArray(data.messages)) return data.messages.map(normalizeMessage)
  if (path === 'messages' && data.message) return normalizeMessage(data.message)
  if (path === 'messages/flags' && Array.isArray(data.alerts)) return data.alerts.map(normalizeDoc)

  if (path === 'practitioners' && Array.isArray(data.practitioners)) return data.practitioners.map(normalizeUser)
  if (path === 'admin/stats' && data.stats) return data.stats
  if (path === 'admin/users' && Array.isArray(data.users)) return data.users.map(normalizeUser)
  if (path.startsWith('admin/users/') && data.user) return normalizeUser(data.user)
  if (path === 'admin/keywords' && Array.isArray(data.keywords)) return data.keywords.map(normalizeDoc)
  if (path === 'admin/keywords' && data.keyword) return normalizeDoc(data.keyword)
  if (path === 'admin/sessions' && Array.isArray(data.sessions)) return data.sessions.map(normalizeSession)
  if (path.startsWith('admin/sessions/') && data.session) return normalizeSession(data.session)
  if (path === 'admin/prescriptions' && Array.isArray(data.prescriptions)) return data.prescriptions.map(normalizePrescription)
  if (path === 'admin/safety-alerts' && Array.isArray(data.alerts)) return data.alerts.map(normalizeSafetyAlert)
  if (path.startsWith('admin/safety-alerts/') && data.alert) return normalizeSafetyAlert(data.alert)
  if (path === 'admin/settings' && data.settings) return data.settings

  if (path === 'articles' && Array.isArray(data.articles)) return data.articles.map(normalizeDoc)
  if (path === 'articles' && data.article) return normalizeDoc(data.article)

  if (path === 'prescriptions' && Array.isArray(data.prescriptions)) return data.prescriptions.map(normalizePrescription)
  if (path === 'prescriptions' && data.prescription) return normalizePrescription(data.prescription)
  if (path.startsWith('users/') && data.user) return normalizeUser(data.user)

  return normalizeDoc(data)
}

function normalizeDoc<T extends Record<string, any>>(doc: T): T & { _id?: string } {
  if (!doc || typeof doc !== 'object') return doc
  return {
    ...doc,
    _id: doc._id ?? doc.id,
  }
}

function normalizeUser(user: any) {
  return normalizeDoc(user)
}

function normalizeSession(session: any) {
  const normalized = normalizeDoc(session)
  return {
    ...normalized,
    clientId: normalizeUser(session.clientId ?? session.client),
    practitionerId: normalizeUser(session.practitionerId ?? session.practitioner),
  }
}

function normalizeMessage(message: any) {
  const normalized = normalizeDoc(message)
  return {
    ...normalized,
    senderId: normalizeUser(message.senderId ?? message.sender),
    receiverId: typeof message.receiverId === 'object' ? normalizeUser(message.receiverId) : message.receiverId ?? message.receiver?.id,
  }
}

function normalizePrescription(prescription: any) {
  const normalized = normalizeDoc(prescription)
  return {
    ...normalized,
    clientId: normalizeUser(prescription.clientId ?? prescription.client),
    psychiatristId: normalizeUser(prescription.psychiatristId ?? prescription.psychiatrist),
  }
}

function normalizeSafetyAlert(alert: any) {
  const normalized = normalizeDoc(alert)
  return {
    ...normalized,
    clientId: normalizeUser(alert.clientId ?? alert.client),
    practitionerId: normalizeUser(alert.practitionerId ?? alert.practitioner),
    messageId: normalizeDoc(alert.messageId ?? alert.message),
  }
}
