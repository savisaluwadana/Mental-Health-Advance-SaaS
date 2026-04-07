import { Schema, Document, model, models, Types } from 'mongoose'

export interface IMessage extends Document {
  conversationId: string
  senderId: Types.ObjectId
  receiverId: Types.ObjectId
  content: string
  flagged: boolean
  flagReasons: string[]
  readAt?: Date
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    flagged: { type: Boolean, default: false },
    flagReasons: [String],
    readAt: Date,
  },
  { timestamps: true }
)

MessageSchema.index({ conversationId: 1, createdAt: 1 })
MessageSchema.index({ flagged: 1, createdAt: -1 })

export default models.Message || model<IMessage>('Message', MessageSchema)
