import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Prescription from '@/models/Prescription'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const MedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
})

const CreatePrescriptionSchema = z.object({
  clientId: z.string(),
  medications: z.array(MedicationSchema).min(1),
  signatureDataUrl: z.string().startsWith('data:image/'),
  sealDataUrl: z.string().startsWith('data:image/'),
  expiresAt: z.string().datetime(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'psychiatrist') {
    return NextResponse.json({ error: 'Forbidden: Psychiatrist only' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  await connectDB()
  const query: Record<string, string> = { psychiatristId: session.user.id }
  if (clientId) query.clientId = clientId

  const prescriptions = await Prescription.find(query)
    .populate('clientId', 'name email phone')
    .sort({ issuedAt: -1 })
    .lean()

  return NextResponse.json(prescriptions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'psychiatrist') {
    return NextResponse.json({ error: 'Forbidden: Psychiatrist only' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreatePrescriptionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await connectDB()

  // Also persist seal to user profile for future prescriptions
  await User.findByIdAndUpdate(session.user.id, { sealDataUrl: parsed.data.sealDataUrl })

  const prescription = await Prescription.create({
    ...parsed.data,
    psychiatristId: session.user.id,
    expiresAt: new Date(parsed.data.expiresAt),
  })

  return NextResponse.json(prescription, { status: 201 })
}
