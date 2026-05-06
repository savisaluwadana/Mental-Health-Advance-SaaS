import { IsOptional, IsString, MaxLength } from 'class-validator'

export class MessageQueryDto {
  @IsOptional()
  @IsString()
  withUserId?: string

  @IsOptional()
  @IsString()
  conversationId?: string
}

export class SendMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string

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
