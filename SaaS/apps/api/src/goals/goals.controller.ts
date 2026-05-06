import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CreateGoalDto, UpdateGoalDto } from './goals.dto'
import { GoalsService } from './goals.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('clientId') clientId?: string) {
    return this.goalsService.list(user, clientId)
  }

  @Roles(Role.psychologist, Role.psychiatrist, Role.counsellor)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.sub, dto)
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(user, dto)
  }
}
