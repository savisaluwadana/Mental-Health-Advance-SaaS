import { IsArray, IsOptional, IsString } from 'class-validator'

export class UpdateClientProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosis?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[]

  @IsOptional()
  @IsString()
  emergencyContactName?: string

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string

  @IsOptional()
  @IsString()
  assignedPractitionerId?: string
}
