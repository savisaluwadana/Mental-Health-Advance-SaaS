import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import SessionModel from '@/models/Session'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Resend } from 'resend'

const CreateSessionSchema = z.object({
  practitionerId: z.string(),
  scheduledAt: z.string().datetime(),
  duration: z.number().default(60),
  type: z.enum(['online', 'physical']),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { role, id } = session.user

  let query: Record<string, string> = {}
  if (role === 'client') query.clientId = id
  else if (role === 'psychologist' || role === 'psychiatrist' || role === 'counsellor') query.practitionerId = id

  const sessions = await SessionModel.find(query)
    .populate('clientId', 'name email avatar')
    .populate('practitionerId', 'name email avatar slmcRegNo')
    .sort({ scheduledAt: 1 })
    .lean()

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'client') {
    return NextResponse.json({ error: 'Only clients can book sessions' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateSessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()

  // Check 24h cancellation window (ensure no same-day double bookings)
  const scheduledAt = new Date(parsed.data.scheduledAt)
  const conflictWindow = new Date(scheduledAt.getTime() - 60 * 60 * 1000) // 1h buffer
  const conflict = await SessionModel.findOne({
    practitionerId: parsed.data.practitionerId,
    scheduledAt: { $gte: conflictWindow, $lte: new Date(scheduledAt.getTime() + 60 * 60 * 1000) },
    status: { $in: ['pending', 'confirmed'] },
  })
  if (conflict) {
    return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 })
  }

  const newSession = await SessionModel.create({
    clientId: session.user.id,
    practitionerId: parsed.data.practitionerId,
    scheduledAt,
    duration: parsed.data.duration,
    type: parsed.data.type,
    status: 'pending',
  })

  // Notify practitioner via Socket.io
  const io = (globalThis as any).io
  if (io) {
    io.to(`user:${parsed.data.practitionerId}`).emit('session:new-booking', {
      sessionId: newSession._id.toString(),
      clientName: session.user.name,
      scheduledAt,
    })
  }

  return NextResponse.json(newSession, { status: 201 })
}
