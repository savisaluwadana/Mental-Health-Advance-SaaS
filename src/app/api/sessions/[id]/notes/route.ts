import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import SessionNote from '@/models/SessionNote'
import SessionModel from '@/models/Session'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const NoteSchema = z.object({
  content: z.string().min(1),
})

// Practitioner-only — session notes are NEVER returned to clients
async function isPractitioner(userId: string, role: string, sessionId: string) {
  if (role !== 'psychologist' && role !== 'psychiatrist') return false
  const s = await SessionModel.findById(sessionId).lean() as any
  return s?.practitionerId?.toString() === userId
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  if (!(await isPractitioner(session.user.id, session.user.role, params.id))) {
    return NextResponse.json({ error: 'Forbidden: Practitioner only' }, { status: 403 })
  }

  const notes = await SessionNote.find({ sessionId: params.id }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  if (!(await isPractitioner(session.user.id, session.user.role, params.id))) {
    return NextResponse.json({ error: 'Forbidden: Practitioner only' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = NoteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const apptSession = await SessionModel.findById(params.id).lean() as any
  if (!apptSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const note = await SessionNote.create({
    sessionId: params.id,
    practitionerId: session.user.id,
    clientId: apptSession.clientId,
    content: parsed.data.content,
  })

  return NextResponse.json(note, { status: 201 })
}
