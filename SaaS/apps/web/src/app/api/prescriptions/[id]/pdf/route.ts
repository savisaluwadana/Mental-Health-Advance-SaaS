import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const response = await fetch(`${API_URL}/prescriptions`, {
    headers: typeof token?.accessToken === 'string' ? { authorization: `Bearer ${token.accessToken}` } : {},
    cache: 'no-store',
  })

  if (!response.ok) {
    return NextResponse.json({ error: { message: 'Unable to load prescription' } }, { status: response.status })
  }

  const { prescriptions } = await response.json()
  const prescription = prescriptions.find((item: any) => item.id === params.id)
  if (!prescription) {
    return NextResponse.json({ error: { message: 'Prescription not found' } }, { status: 404 })
  }

  const lines = [
    'MindBridge SL Prescription',
    `Client: ${prescription.client?.name ?? 'Client'}`,
    `Psychiatrist: ${prescription.psychiatrist?.name ?? 'Psychiatrist'}`,
    `Issued: ${new Date(prescription.issuedAt).toLocaleDateString()}`,
    '',
    ...prescription.medications.map((med: any) => `${med.name} - ${med.dosage}, ${med.frequency}, ${med.duration}`),
  ]

  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain',
      'content-disposition': `attachment; filename="prescription-${params.id.slice(-8)}.txt"`,
    },
  })
}
