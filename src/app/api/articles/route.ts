import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await connectDB()
  const articles = await Article.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(articles)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  await connectDB()
  const article = await Article.create(body)
  return NextResponse.json(article, { status: 201 })
}
