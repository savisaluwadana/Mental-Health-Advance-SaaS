import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { ClientsService } from './clients.service'
import { UpdateClientProfileDto } from './clients.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor, Role.admin)
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.clientsService.list(user)
  }

  @Roles(Role.client)
  @Get('me/profile')
  myProfile(@CurrentUser() user: AuthUser) {
    return this.clientsService.profile(user.sub)
  }

  @Roles(Role.client, Role.admin)
  @Patch('me/profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateClientProfileDto) {
    return this.clientsService.updateProfile(user.sub, dto)
  }
}
