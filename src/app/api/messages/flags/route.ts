import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role } = session.user
  if (role !== 'psychologist' && role !== 'psychiatrist' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const query: Record<string, unknown> = { flagged: true }
  // Practitioners only see flags from their conversations
  if (role !== 'admin') {
    query.receiverId = session.user.id
  }

  const flags = await Message.find(query)
    .populate('senderId', 'name avatar email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  return NextResponse.json(flags)
}
