import { Schema, Document, model, models, Types } from 'mongoose'

export interface IWeeklyCheckIn {
  week: Date
  progressRating: number // 1–5
  note?: string
}

export interface IGoal extends Document {
  clientId: Types.ObjectId
  practitionerId: Types.ObjectId
  title: string
  description?: string
  targetDate?: Date
  completedAt?: Date
  weeklyCheckIns: IWeeklyCheckIn[]
  createdAt: Date
  updatedAt: Date
}

const WeeklyCheckInSchema = new Schema<IWeeklyCheckIn>({
  week: { type: Date, required: true },
  progressRating: { type: Number, min: 1, max: 5, required: true },
  note: String,
})

const GoalSchema = new Schema<IGoal>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    practitionerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    targetDate: Date,
    completedAt: Date,
    weeklyCheckIns: [WeeklyCheckInSchema],
  },
  { timestamps: true }
)

export default models.Goal || model<IGoal>('Goal', GoalSchema)
