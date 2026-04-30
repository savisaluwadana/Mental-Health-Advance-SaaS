import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import ClientProfile from '@/models/ClientProfile'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'psychologist', 'psychiatrist', 'counsellor']),
  phone: z.string().optional(),
  province: z.string().optional(),
  languages: z.array(z.string()).optional(),
  slmcRegNo: z.string().optional(),
  slmcCertificateDataUrl: z.string().optional(),
  nicDocumentDataUrl: z.string().optional(),
  specialty: z.string().optional(),
  sessionTypes: z.array(z.enum(['online', 'physical'])).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password, role, ...rest } = parsed.data

    // Require verification docs for practitioners
    const isPractitioner = role === 'psychologist' || role === 'psychiatrist' || role === 'counsellor'
    if (isPractitioner && !rest.slmcRegNo) {
      return NextResponse.json({ error: { slmcRegNo: ['SLMC registration number is required for practitioners'] } }, { status: 400 })
    }
    if (isPractitioner && !rest.slmcCertificateDataUrl) {
      return NextResponse.json({ error: { slmcCertificateDataUrl: ['SLMC certificate is required for verification'] } }, { status: 400 })
    }
    if (isPractitioner && !rest.nicDocumentDataUrl) {
      return NextResponse.json({ error: { nicDocumentDataUrl: ['NIC document is required for verification'] } }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: { email: ['Email already registered'] } }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, hashedPassword, role, ...rest })

    // Auto-create client profile
    if (role === 'client') {
      await ClientProfile.create({ userId: user._id })
    }

    return NextResponse.json(
      { message: 'Account created successfully', userId: user._id.toString() },
      { status: 201 }
    )
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
