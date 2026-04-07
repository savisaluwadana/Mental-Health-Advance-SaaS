import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import KeywordAlert from '@/models/KeywordAlert'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const KeywordSchema = z.object({
  keyword: z.string().min(1).max(50),
  category: z.enum(['crisis', 'financial', 'other']).default('other'),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const keywords = await KeywordAlert.find().sort({ category: 1, keyword: 1 }).lean()
  return NextResponse.json(keywords)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = KeywordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()
  const existing = await KeywordAlert.findOne({ keyword: parsed.data.keyword.toLowerCase() })
  if (existing) return NextResponse.json({ error: 'Keyword already exists' }, { status: 409 })

  const kw = await KeywordAlert.create({ ...parsed.data, createdBy: session.user.id })
  return NextResponse.json(kw, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await connectDB()
  await KeywordAlert.findByIdAndDelete(id)
  return NextResponse.json({ message: 'Deleted' })
}
