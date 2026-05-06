import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CreateMoodEntryDto, MoodQueryDto } from './mood.dto'
import { MoodService } from './mood.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: MoodQueryDto) {
    return this.moodService.list(user, query)
  }

  @Roles(Role.client)
  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: CreateMoodEntryDto) {
    return this.moodService.upsert(user.sub, dto)
  }
}
