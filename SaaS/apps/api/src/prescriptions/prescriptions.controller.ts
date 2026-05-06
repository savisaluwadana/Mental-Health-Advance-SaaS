import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CreatePrescriptionDto } from './prescriptions.dto'
import { PrescriptionsService } from './prescriptions.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.prescriptionsService.list(user)
  }

  @Roles(Role.psychiatrist, Role.admin)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(user, dto)
  }
}
