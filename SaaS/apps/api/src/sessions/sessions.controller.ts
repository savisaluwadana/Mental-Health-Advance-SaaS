import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CreateSessionDto, UpsertSessionNoteDto } from './sessions.dto'
import { SessionsService } from './sessions.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.sessionsService.list(user)
  }

  @Roles(Role.client, Role.admin)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user, dto)
  }

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor, Role.admin)
  @Get(':id/notes')
  note(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sessionsService.note(user, id)
  }

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor, Role.admin)
  @Post(':id/notes')
  upsertNote(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpsertSessionNoteDto) {
    return this.sessionsService.upsertNote(user, id, dto)
  }
}
