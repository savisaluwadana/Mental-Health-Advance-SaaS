import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { AcknowledgeAlertDto, MessageQueryDto, SendMessageDto } from './messages.dto'
import { MessagesService } from './messages.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: MessageQueryDto) {
    return this.messagesService.list(user, query)
  }

  @Post()
  send(@CurrentUser() user: AuthUser, @Body() dto: SendMessageDto) {
    return this.messagesService.send(user, dto)
  }

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor, Role.admin)
  @Get('alerts')
  alerts(@CurrentUser() user: AuthUser) {
    return this.messagesService.alerts(user)
  }

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor, Role.admin)
  @Patch('alerts/:id')
  updateAlert(@Param('id') id: string, @Body() dto: AcknowledgeAlertDto) {
    return this.messagesService.updateAlert(id, dto.status ?? 'acknowledged')
  }
}
