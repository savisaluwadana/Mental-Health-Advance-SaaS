import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  hashedPassword: string
  role: 'client' | 'psychologist' | 'psychiatrist' | 'counsellor' | 'admin'
  avatar?: string
  phone?: string
  slmcRegNo?: string
  slmcCertificateDataUrl?: string
  nicDocumentDataUrl?: string
  province?: string
  languages: string[]
  timezone?: string
  theme: 'light' | 'dark'
  bio?: string
  specialty?: string
  sessionTypes?: ('online' | 'physical')[]
  sealDataUrl?: string
  verified?: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    hashedPassword: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'psychologist', 'psychiatrist', 'counsellor', 'admin'],
      required: true,
    },
    avatar: String,
    phone: String,
    slmcRegNo: String,
    slmcCertificateDataUrl: String,
    nicDocumentDataUrl: String,
    province: String,
    languages: [String],
    timezone: { type: String, default: 'Asia/Colombo' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    bio: String,
    specialty: String,
    sessionTypes: [{ type: String, enum: ['online', 'physical'] }],
    sealDataUrl: String, // base64 seal for psychiatrists
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default models.User || model<IUser>('User', UserSchema)
