import { SessionType } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreateSessionDto {
  @IsString()
  practitionerId!: string

  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date

  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number

  @IsEnum(SessionType)
  type!: SessionType

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpsertSessionNoteDto {
  @IsString()
  content!: string
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  meetingLink?: string
}
