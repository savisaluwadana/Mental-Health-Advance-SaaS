import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  await connectDB()
  
  // Prune body to prevent unauthorized password changes
  const updates = { ...body }
  delete updates.hashedPassword

  const user = await User.findByIdAndUpdate(params.id, { $set: updates }, { new: true }).select('-hashedPassword')
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const user = await User.findByIdAndDelete(params.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
  return NextResponse.json({ message: 'User deleted' })
}
