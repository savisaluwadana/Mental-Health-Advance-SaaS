import { IsOptional, IsString, MaxLength } from 'class-validator'

export class MessageQueryDto {
  @IsOptional()
  @IsString()
  withUserId?: string
}

export class SendMessageDto {
  @IsString()
  receiverId!: string

  @IsString()
  @MaxLength(1000)
  content!: string
}

export class AcknowledgeAlertDto {
  @IsOptional()
  @IsString()
  status?: 'acknowledged' | 'escalated'
}
