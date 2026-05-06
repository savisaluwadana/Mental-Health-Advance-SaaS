import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export async function serverApi<T>(path: string): Promise<T> {
  const session = await getServerSession(authOptions)
  const response = await fetch(`${API_URL}${path}`, {
    headers: session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {},
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`)
  }

  return response.json() as Promise<T>
}

export function asMongoDoc<T extends Record<string, any>>(doc: T): T & { _id?: string } {
  return { ...doc, _id: doc._id ?? doc.id }
}

export function asMongoSession(session: any) {
  return {
    ...asMongoDoc(session),
    clientId: asMongoDoc(session.client ?? session.clientId ?? {}),
    practitionerId: asMongoDoc(session.practitioner ?? session.practitionerId ?? {}),
  }
}

export function asMongoMessage(message: any) {
  return {
    ...asMongoDoc(message),
    senderId: asMongoDoc(message.sender ?? message.senderId ?? {}),
    receiverId: message.receiverId ?? message.receiver?.id,
  }
}
