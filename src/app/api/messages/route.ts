import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import SessionModel from '@/models/Session'
import { authOptions } from '@/lib/auth'
import { scanMessage } from '@/lib/keywordEngine'
import { encrypt, decrypt } from '@/lib/encryption'
import { z } from 'zod'

const SendMessageSchema = z.object({
  conversationId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(1000),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })

  await connectDB()
  const messages = await Message.find({ conversationId })
    .populate('senderId', 'name avatar role')
    .sort({ createdAt: 1 })
    .lean()

  const decryptedMessages = messages.map((msg: any) => ({
    ...msg,
    content: decrypt(msg.content)
  }))

  return NextResponse.json(decryptedMessages)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()

  // Enforce session constraints (1 hour before, to 1 hour after duration)
  const now = new Date()
  const activeSessions = await SessionModel.find({
    status: { $in: ['confirmed', 'in-progress', 'completed'] },
    $or: [
      { clientId: session.user.id, practitionerId: parsed.data.receiverId },
      { practitionerId: session.user.id, clientId: parsed.data.receiverId }
    ],
    scheduledAt: { 
      $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), 
      $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) 
    }
  })

  const isWithinWindow = activeSessions.some(s => {
    const startWindow = new Date(s.scheduledAt.getTime() - 60 * 60 * 1000)
    const endWindow = new Date(s.scheduledAt.getTime() + ((s.duration || 60) * 60 * 1000) + 60 * 60 * 1000)
    return now >= startWindow && now <= endWindow
  })

  if (!isWithinWindow) {
    return NextResponse.json({ error: 'Messaging is disabled. Chat is only available during scheduled video calls.' }, { status: 403 })
  }

  // Run keyword scan
  const { flagged, reasons } = await scanMessage(parsed.data.content, session.user.id)

  const encryptedContent = encrypt(parsed.data.content)

  const message = await Message.create({
    conversationId: parsed.data.conversationId,
    senderId: session.user.id,
    receiverId: parsed.data.receiverId,
    content: encryptedContent,
    flagged,
    flagReasons: reasons,
  })

  const populated = await message.populate('senderId', 'name avatar role')
  const emitPayload = { ...populated.toObject(), content: parsed.data.content }

  // Emit via Socket.io
  const io = (globalThis as any).io
  if (io) {
    io.to(parsed.data.conversationId).emit('message:received', emitPayload)
    if (flagged) {
      io.to(`user:${parsed.data.receiverId}`).emit('alert:flagged-message', {
        message: emitPayload,
        conversationId: parsed.data.conversationId,
      })
    }
  }

  return NextResponse.json(emitPayload, { status: 201 })
}
