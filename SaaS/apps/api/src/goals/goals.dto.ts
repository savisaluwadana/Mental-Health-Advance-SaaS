import { Type } from 'class-transformer'
import { IsDate, IsOptional, IsString } from 'class-validator'

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
