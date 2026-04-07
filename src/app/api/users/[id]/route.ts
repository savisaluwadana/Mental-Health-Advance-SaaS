import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  province: z.string().optional(),
  languages: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  sessionTypes: z.array(z.enum(['online', 'physical'])).optional(),
  sealDataUrl: z.string().optional(), // base64 seal for psychiatrists
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only self or admin can read
  if (session.user.id !== params.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const user = await User.findById(params.id).select('-hashedPassword').lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.id !== params.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()
  const updated = await User.findByIdAndUpdate(params.id, parsed.data, { new: true }).select('-hashedPassword')
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(updated)
}
