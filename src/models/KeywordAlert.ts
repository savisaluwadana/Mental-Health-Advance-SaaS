import { Schema, Document, model, models, Types } from 'mongoose'

export interface IKeywordAlert extends Document {
  keyword: string
  category: 'crisis' | 'financial' | 'other'
  createdBy: Types.ObjectId
  createdAt: Date
}

const KeywordAlertSchema = new Schema<IKeywordAlert>(
  {
    keyword: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['crisis', 'financial', 'other'],
      default: 'other',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export default models.KeywordAlert || model<IKeywordAlert>('KeywordAlert', KeywordAlertSchema)
