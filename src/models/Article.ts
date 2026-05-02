import { Schema, Document, model, models } from 'mongoose'

export interface IArticle extends Document {
  title: string
  category: string
  desc: string
  content?: string
  readTime: string
  marker: string
  createdAt: Date
  updatedAt: Date
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },
    content: { type: String },
    readTime: { type: String, required: true },
    marker: { type: String, required: true, maxLength: 2 },
  },
  { timestamps: true }
)

export default models.Article || model<IArticle>('Article', ArticleSchema)
