import { Type } from 'class-transformer'
import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator'

class MedicationDto {
  @IsString()
  name!: string

  @IsString()
  dosage!: string

  @IsString()
  frequency!: string

  @IsString()
  duration!: string
}

export class CreatePrescriptionDto {
  @IsString()
  clientId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications!: MedicationDto[]

  @IsString()
  signatureDataUrl!: string

  @IsString()
  sealDataUrl!: string

  @Type(() => Date)
  @IsDate()
  expiresAt!: Date
}
