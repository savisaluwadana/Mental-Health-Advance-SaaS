import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionDocument } from '@/lib/PrescriptionDocument'

export const runtime = 'nodejs'

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const response = await fetch(`${API_URL}/prescriptions`, {
    headers: typeof token?.accessToken === 'string' ? { authorization: `Bearer ${token.accessToken}` } : {},
    cache: 'no-store',
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Unable to load prescription' }, { status: response.status })
  }

  const { prescriptions } = await response.json()
  const prescription = prescriptions.find((item: any) => item.id === params.id)
  if (!prescription) {
    return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
  }

  const document = React.createElement(PrescriptionDocument, {
      prescriptionId: prescription.id,
      issuedAt: new Date(prescription.issuedAt).toLocaleDateString(),
      expiresAt: new Date(prescription.expiresAt).toLocaleDateString(),
      psychiatristName: prescription.psychiatrist?.name ?? 'Psychiatrist',
      slmcRegNo: prescription.psychiatrist?.slmcRegNo ?? 'N/A',
      clientName: prescription.client?.name ?? 'Client',
      clientPhone: prescription.client?.phone ?? undefined,
      medications: prescription.medications ?? [],
      signatureDataUrl: prescription.signatureDataUrl,
      sealDataUrl: prescription.sealDataUrl,
    })
  const pdf = await renderToBuffer(document as any)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="prescription-${params.id.slice(-8)}.pdf"`,
    },
  })
}
