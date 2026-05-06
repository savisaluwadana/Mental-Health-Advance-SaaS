import { Type } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'

export class CreateGoalDto {
  @IsString()
  clientId!: string

  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetDate?: Date
}

class WeeklyCheckInDto {
  @Type(() => Date)
  @IsDate()
  week!: Date

  @IsInt()
  @Min(1)
  @Max(5)
  progressRating!: number

  @IsOptional()
  @IsString()
  note?: string
}

export class UpdateGoalDto {
  @IsString()
  id!: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date | null

  @IsOptional()
  @ValidateNested()
  @Type(() => WeeklyCheckInDto)
  weeklyCheckIn?: WeeklyCheckInDto
}
