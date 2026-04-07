import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Goal from '@/models/Goal'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const CreateGoalSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().datetime().optional(),
})

const UpdateGoalSchema = z.object({
  id: z.string(),
  completedAt: z.string().datetime().nullable().optional(),
  weeklyCheckIn: z.object({
    week: z.string().datetime(),
    progressRating: z.number().int().min(1).max(5),
    note: z.string().optional(),
  }).optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId') || session.user.id

  await connectDB()
  const goals = await Goal.find({ clientId }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.role
  if (role !== 'psychologist' && role !== 'psychiatrist') {
    return NextResponse.json({ error: 'Only practitioners can create goals' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateGoalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()
  const goal = await Goal.create({
    ...parsed.data,
    practitionerId: session.user.id,
    targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
  })

  return NextResponse.json(goal, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateGoalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()
  const goal = await Goal.findById(parsed.data.id)
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 })

  // Clients can add weekly check-ins or mark complete; practitioners can do all
  const { role, id } = session.user
  if (role === 'client' && goal.clientId.toString() !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (parsed.data.completedAt !== undefined) {
    goal.completedAt = parsed.data.completedAt ? new Date(parsed.data.completedAt) : undefined
  }

  if (parsed.data.weeklyCheckIn) {
    goal.weeklyCheckIns.push({
      week: new Date(parsed.data.weeklyCheckIn.week),
      progressRating: parsed.data.weeklyCheckIn.progressRating,
      note: parsed.data.weeklyCheckIn.note,
    })
  }

  await goal.save()
  return NextResponse.json(goal)
}
