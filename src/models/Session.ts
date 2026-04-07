import { Schema, Document, model, models, Types } from 'mongoose'

export interface ISession extends Document {
  clientId: Types.ObjectId
  practitionerId: Types.ObjectId
  scheduledAt: Date
  duration: number // minutes
  type: 'online' | 'physical'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  meetingLink?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    practitionerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    type: { type: String, enum: ['online', 'physical'], required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    meetingLink: String,
    notes: String,
  },
  { timestamps: true }
)

export default models.Session || model<ISession>('Session', SessionSchema)
