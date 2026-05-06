import { Role, SessionType } from '@prisma/client'
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @MinLength(8)
  password!: string

  @IsEnum(Role)
  role!: Role

  @IsOptional()
  @IsString()
  phone?: string

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

  @IsOptional()
  @IsArray()
  @IsEnum(SessionType, { each: true })
  sessionTypes?: SessionType[]
}

export class LoginDto {
  @IsEmail()
  email!: string

  @MinLength(8)
  password!: string
}
