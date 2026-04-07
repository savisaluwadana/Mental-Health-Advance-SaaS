import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Prescription from '@/models/Prescription'
import User from '@/models/User'
import { authOptions } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { PrescriptionDocument } from '@/lib/PrescriptionDocument'
import React from 'react'
import { format } from 'date-fns'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'psychiatrist') {
    return NextResponse.json({ error: 'Forbidden: Psychiatrist only' }, { status: 403 })
  }

  await connectDB()

  const prescription = await Prescription.findById(params.id)
    .populate('clientId', 'name phone')
    .populate('psychiatristId', 'name slmcRegNo')
    .lean() as any

  if (!prescription) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ensure the requesting psychiatrist owns this prescription
  if (prescription.psychiatristId._id?.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate PDF on-demand — never stored to disk
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(PrescriptionDocument, {
      prescriptionId: prescription._id.toString().slice(-8).toUpperCase(),
      issuedAt: format(new Date(prescription.issuedAt), 'dd MMM yyyy'),
      expiresAt: format(new Date(prescription.expiresAt), 'dd MMM yyyy'),
      psychiatristName: prescription.psychiatristId.name,
      slmcRegNo: prescription.psychiatristId.slmcRegNo || 'N/A',
      clientName: prescription.clientId.name,
      clientPhone: prescription.clientId.phone,
      medications: prescription.medications,
      signatureDataUrl: prescription.signatureDataUrl,
      sealDataUrl: prescription.sealDataUrl,
    }) as any
  )

  // Stream as binary download — not persisted anywhere
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${params.id.slice(-8)}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
