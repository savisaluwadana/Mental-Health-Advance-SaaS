import { SessionType } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class PractitionerQueryDto {
  @IsOptional()
  @IsString()
  province?: string

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType
}
