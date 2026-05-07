import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [],
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2pt solid #14b89a',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14b89a',
  },
  brandTagline: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0f7565',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f0fdfb',
    borderRadius: 4,
    padding: 10,
    border: '1pt solid #ccfbf0',
  },
  infoLabel: {
    fontSize: 8,
    color: '#0d937c',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 11,
    color: '#1a1a2e',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f7565',
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottom: '1pt solid #99f4e2',
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#14b89a',
    color: '#ffffff',
    padding: '6 8',
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '5 8',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 1 },
  col4: { flex: 1 },
  colHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colCell: { fontSize: 10 },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1pt solid #e5e7eb',
  },
  signatureBox: {
    alignItems: 'center',
    width: '45%',
  },
  signatureImage: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  sealImage: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1pt solid #9ca3af',
    marginTop: 8,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 8,
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    border: '1pt solid #fbbf24',
    borderRadius: 4,
    padding: 8,
    marginTop: 16,
    fontSize: 9,
    color: '#92400e',
  },
})

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface PrescriptionPDFProps {
  prescriptionId: string
  issuedAt: string
  expiresAt: string
  psychiatristName: string
  slmcRegNo: string
  clientName: string
  clientPhone?: string
  medications: Medication[]
  signatureDataUrl: string
  sealDataUrl: string
}

export function PrescriptionDocument({
  prescriptionId,
  issuedAt,
  expiresAt,
  psychiatristName,
  slmcRegNo,
  clientName,
  clientPhone,
  medications,
  signatureDataUrl,
  sealDataUrl,
}: PrescriptionPDFProps) {
  return (
    <Document
      title={`Prescription - ${clientName}`}
      author={psychiatristName}
      subject="Medical Prescription — SafeSpace Lanka"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>SafeSpace Lanka</Text>
            <Text style={styles.brandTagline}>Mental Health Platform — Sri Lanka</Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'right' }}>
              Rx No: {prescriptionId}
            </Text>
            <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'right', marginTop: 2 }}>
              Issued: {issuedAt}
            </Text>
            <Text style={{ fontSize: 9, color: '#6b7280', textAlign: 'right', marginTop: 2 }}>
              Expires: {expiresAt}
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.docTitle}>Medical Prescription</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Prescribing Psychiatrist</Text>
            <Text style={styles.infoValue}>{psychiatristName}</Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
              SLMC Reg No: {slmcRegNo}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
            {clientPhone && (
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                Phone: {clientPhone}
              </Text>
            )}
          </View>
        </View>

        {/* Medications Table */}
        <Text style={styles.sectionTitle}>Prescribed Medications</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Medication</Text>
            <Text style={[styles.col2, styles.colHeader]}>Dosage</Text>
            <Text style={[styles.col3, styles.colHeader]}>Frequency</Text>
            <Text style={[styles.col4, styles.colHeader]}>Duration</Text>
          </View>
          {medications.map((med, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.col1, styles.colCell]}>{med.name}</Text>
              <Text style={[styles.col2, styles.colCell]}>{med.dosage}</Text>
              <Text style={[styles.col3, styles.colCell]}>{med.frequency}</Text>
              <Text style={[styles.col4, styles.colCell]}>{med.duration}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            Important: This prescription is issued by a licensed psychiatrist registered with the Sri Lanka
            Medical Council (SLMC). It is valid for the duration specified above and must be
            dispensed by a registered pharmacist. Do not self-medicate.
          </Text>
        </View>

        {/* Signature & Seal */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {signatureDataUrl && (
              <Image style={styles.signatureImage} src={signatureDataUrl} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Psychiatrist Signature</Text>
            <Text style={[styles.signatureLabel, { marginTop: 2 }]}>{psychiatristName}</Text>
            <Text style={[styles.signatureLabel, { marginTop: 1 }]}>SLMC Reg: {slmcRegNo}</Text>
          </View>
          <View style={styles.signatureBox}>
            {sealDataUrl && (
              <Image style={styles.sealImage} src={sealDataUrl} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Official Seal</Text>
            <Text style={[styles.signatureLabel, { marginTop: 2 }]}>SafeSpace Lanka</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>SafeSpace Lanka — Confidential Medical Document</Text>
          <Text>For queries: support@safespacelanka.lk</Text>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  )
}
