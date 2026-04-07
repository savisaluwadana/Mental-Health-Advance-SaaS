import { Schema, Document, model, models, Types } from 'mongoose'

interface IMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface IPrescription extends Document {
  clientId: Types.ObjectId
  psychiatristId: Types.ObjectId
  medications: IMedication[]
  signatureDataUrl: string // base64 PNG drawn on canvas
  sealDataUrl: string // base64 PNG uploaded at onboarding
  issuedAt: Date
  expiresAt: Date
  status: 'active' | 'expired' | 'revoked'
  createdAt: Date
}

const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
})

const PrescriptionSchema = new Schema<IPrescription>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    psychiatristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medications: [MedicationSchema],
    signatureDataUrl: { type: String, required: true }, // base64, no S3
    sealDataUrl: { type: String, required: true },      // base64, no S3
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export default models.Prescription || model<IPrescription>('Prescription', PrescriptionSchema)
