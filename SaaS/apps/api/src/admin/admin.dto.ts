import { Role } from '@prisma/client'
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'

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
