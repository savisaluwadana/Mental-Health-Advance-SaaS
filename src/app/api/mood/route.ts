import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import MoodEntry from '@/models/MoodEntry'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const MoodSchema = z.object({
  date: z.string().datetime().optional(),
  score: z.number().int().min(1).max(10),
  emotions: z.array(z.string()).default([]),
  note: z.string().max(500).optional(),
  sharedWithPractitioner: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId') || session.user.id
  const days = parseInt(searchParams.get('days') || '30')

  await connectDB()

  // Practitioner can only see shared entries
  const query: Record<string, unknown> = {
    clientId,
    date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
  }

  const role = session.user.role
  if (role === 'psychologist' || role === 'psychiatrist') {
    if (clientId === session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    query.sharedWithPractitioner = true
  } else if (role === 'client' && clientId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const entries = await MoodEntry.find(query).sort({ date: -1 }).lean()
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'client') {
    return NextResponse.json({ error: 'Only clients can log mood' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = MoodSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()

  // Only one entry per day
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const existing = await MoodEntry.findOne({
    clientId: session.user.id,
    date: { $gte: today, $lt: tomorrow },
  })

  if (existing) {
    // Update today's entry
    const updated = await MoodEntry.findByIdAndUpdate(existing._id, parsed.data, { new: true })
    return NextResponse.json(updated)
  }

  const entry = await MoodEntry.create({
    clientId: session.user.id,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    ...parsed.data,
  })

  return NextResponse.json(entry, { status: 201 })
}
