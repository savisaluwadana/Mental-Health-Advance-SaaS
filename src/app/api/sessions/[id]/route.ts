import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import SessionModel from '@/models/Session'
import Message from '@/models/Message'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const UpdateSessionSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const apptSession = await SessionModel.findById(params.id)
    .populate('clientId', 'name email avatar phone')
    .populate('practitionerId', 'name email avatar slmcRegNo')
    .lean() as any

  if (!apptSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only participants or admin can view
  const { id, role } = session.user
  const clientId = apptSession.clientId?._id?.toString?.() ?? apptSession.clientId?.toString()
  const practId = apptSession.practitionerId?._id?.toString?.() ?? apptSession.practitionerId?.toString()
  if (role !== 'admin' && id !== clientId && id !== practId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(apptSession)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateSessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()
  const apptSession = await SessionModel.findById(params.id)
  if (!apptSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { id, role } = session.user
  const clientId = apptSession.clientId?.toString()
  const practId = apptSession.practitionerId?.toString()

  // Client can only cancel (24h rule)
  if (role === 'client') {
    if (id !== clientId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (parsed.data.status !== 'cancelled') {
      return NextResponse.json({ error: 'Clients can only cancel sessions' }, { status: 403 })
    }
    const hoursUntil = (apptSession.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntil < 24) {
      return NextResponse.json({ error: 'Cannot cancel within 24 hours of session' }, { status: 400 })
    }
  }

  // Practitioner can confirm, complete, cancel, add meetingLink
  if ((role === 'psychologist' || role === 'psychiatrist') && id !== practId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await SessionModel.findByIdAndUpdate(params.id, parsed.data, { new: true })
    .populate('clientId', 'name email')
    .populate('practitionerId', 'name email')

  if (parsed.data.status === 'completed') {
    const cid = [clientId, practId].sort().join('_')
    await Message.deleteMany({ conversationId: cid })
  }

  // Notify via Socket.io
  const io = (globalThis as any).io
  if (io && parsed.data.status) {
    io.to(`user:${clientId}`).emit('session:status-update', {
      sessionId: params.id,
      status: parsed.data.status,
    })
  }

  return NextResponse.json(updated)
}
