import { Schema, Document, model, models, Types } from 'mongoose'

export interface IMoodEntry extends Document {
  clientId: Types.ObjectId
  date: Date
  score: number // 1–10
  emotions: string[]
  note?: string
  sharedWithPractitioner: boolean
  createdAt: Date
}

const MoodEntrySchema = new Schema<IMoodEntry>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    score: { type: Number, min: 1, max: 10, required: true },
    emotions: [String],
    note: String,
    sharedWithPractitioner: { type: Boolean, default: false },
  },
  { timestamps: true }
)

MoodEntrySchema.index({ clientId: 1, date: -1 })

export default models.MoodEntry || model<IMoodEntry>('MoodEntry', MoodEntrySchema)
