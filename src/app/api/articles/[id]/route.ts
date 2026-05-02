import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { authOptions } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  await connectDB()
  const article = await Article.findByIdAndUpdate(params.id, body, { new: true })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  return NextResponse.json(article)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const article = await Article.findByIdAndDelete(params.id)
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  return NextResponse.json({ success: true })
}
