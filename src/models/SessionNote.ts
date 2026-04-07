import { Schema, Document, model, models, Types } from 'mongoose'

export interface ISessionNote extends Document {
  sessionId: Types.ObjectId
  practitionerId: Types.ObjectId
  clientId: Types.ObjectId
  content: string // rich text HTML
  createdAt: Date
  updatedAt: Date
}

const SessionNoteSchema = new Schema<ISessionNote>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    practitionerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
)

// Ensure notes are NEVER returned by client-facing queries
// Enforcement is at API route level using role guard
SessionNoteSchema.index({ sessionId: 1, practitionerId: 1 })

export default models.SessionNote || model<ISessionNote>('SessionNote', SessionNoteSchema)
