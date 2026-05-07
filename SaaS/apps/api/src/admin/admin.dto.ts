import { AlertStatus, Role, SessionStatus } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsBoolean()
  verified?: boolean

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  @IsString()
  assignedPractitionerId?: string
}

export class CreateKeywordDto {
  @IsString()
  keyword!: string

  @IsString()
  category!: string
}

export class CreatePractitionerDto {
  @IsString()
  name!: string

  @IsString()
  email!: string

  @IsEnum(Role)
  role!: Role

  @IsString()
  password!: string

  @IsOptional()
  @IsString()
  province?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @IsOptional()
  @IsString()
  specialty?: string

  @IsOptional()
  @IsString()
  bio?: string
}

export class UpdateAdminSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus

  @IsOptional()
  @IsString()
  meetingLink?: string

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number
}

export class UpdateSafetyAlertDto {
  @IsEnum(AlertStatus)
  status!: AlertStatus
}

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  platformName?: string

  @IsOptional()
  @IsBoolean()
  registrationsOpen?: boolean

  @IsOptional()
  @IsBoolean()
  practitionerAutoVerify?: boolean

  @IsOptional()
  @IsBoolean()
  crisisBannerEnabled?: boolean

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean

  @IsOptional()
  @IsNumber()
  @Min(15)
  defaultSessionDuration?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedLanguages?: string[]

  @IsOptional()
  @IsString()
  supportEmail?: string
}
