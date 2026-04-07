import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const province = searchParams.get('province')
  const language = searchParams.get('language')
  const role = searchParams.get('role') // psychologist | psychiatrist
  const type = searchParams.get('type') // online | physical
  const search = searchParams.get('search')

  await connectDB()

  const query: Record<string, unknown> = {
    role: role ? role : { $in: ['psychologist', 'psychiatrist'] },
  }

  if (province) query.province = province
  if (language) query.languages = { $in: [language] }
  if (type) query.sessionTypes = { $in: [type] }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ]
  }

  const practitioners = await User.find(query)
    .select('name email avatar slmcRegNo province languages bio specialty sessionTypes role')
    .lean()

  return NextResponse.json(practitioners)
}
