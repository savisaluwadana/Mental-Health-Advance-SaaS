import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class MoodQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string
}

export class CreateMoodEntryDto {
  @Type(() => Date)
  @IsDate()
  date!: Date

  @IsInt()
  @Min(1)
  @Max(10)
  score!: number

  @IsArray()
  @IsString({ each: true })
  emotions!: string[]

  @IsOptional()
  @IsString()
  note?: string

  @IsOptional()
  @IsBoolean()
  sharedWithPractitioner?: boolean
}
