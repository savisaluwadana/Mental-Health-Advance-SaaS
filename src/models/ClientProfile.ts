import { Schema, Document, model, models, Types } from 'mongoose'

export interface IClientProfile extends Document {
  userId: Types.ObjectId
  diagnosis: string[]
  currentMedications: string[]
  goals: Types.ObjectId[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  assignedPractitionerId?: Types.ObjectId
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    diagnosis: [String],
    currentMedications: [String],
    goals: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    assignedPractitionerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default models.ClientProfile || model<IClientProfile>('ClientProfile', ClientProfileSchema)
