import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { authOptions } from '@/lib/auth'
import { scanMessage } from '@/lib/keywordEngine'
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

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()

  // Run keyword scan
  const { flagged, reasons } = await scanMessage(parsed.data.content, session.user.id)

  const message = await Message.create({
    conversationId: parsed.data.conversationId,
    senderId: session.user.id,
    receiverId: parsed.data.receiverId,
    content: parsed.data.content,
    flagged,
    flagReasons: reasons,
  })

  const populated = await message.populate('senderId', 'name avatar role')

  // Emit via Socket.io
  const io = (globalThis as any).io
  if (io) {
    io.to(parsed.data.conversationId).emit('message:received', populated)
    if (flagged) {
      io.to(`user:${parsed.data.receiverId}`).emit('alert:flagged-message', {
        message: populated,
        conversationId: parsed.data.conversationId,
      })
    }
  }

  return NextResponse.json(populated, { status: 201 })
}
