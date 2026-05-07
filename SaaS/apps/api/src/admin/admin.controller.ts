import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { AdminService } from './admin.service'
import {
  CreateKeywordDto,
  CreatePractitionerDto,
  UpdateAdminSessionDto,
  UpdatePlatformSettingsDto,
  UpdateSafetyAlertDto,
  UpdateUserDto,
} from './admin.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.stats()
  }

  @Get('users')
  users(@Query('role') role?: string, @Query('search') search?: string) {
    return this.adminService.users({ role, search })
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto)
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id)
  }

  @Post('practitioners')
  createPractitioner(@Body() dto: CreatePractitionerDto) {
    return this.adminService.createPractitioner(dto)
  }

  @Get('sessions')
  sessions(@Query('status') status?: string, @Query('type') type?: string, @Query('search') search?: string) {
    return this.adminService.sessions({ status, type, search })
  }

  @Patch('sessions/:id')
  updateSession(@Param('id') id: string, @Body() dto: UpdateAdminSessionDto) {
    return this.adminService.updateSession(id, dto)
  }

  @Get('prescriptions')
  prescriptions(@Query('status') status?: string, @Query('search') search?: string) {
    return this.adminService.prescriptions({ status, search })
  }

  @Get('safety-alerts')
  safetyAlerts(@Query('status') status?: string, @Query('search') search?: string) {
    return this.adminService.safetyAlerts({ status, search })
  }

  @Patch('safety-alerts/:id')
  updateSafetyAlert(@Param('id') id: string, @Body() dto: UpdateSafetyAlertDto) {
    return this.adminService.updateSafetyAlert(id, dto)
  }

  @Get('settings')
  settings() {
    return this.adminService.settings()
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.adminService.updateSettings(dto)
  }

  @Get('keywords')
  keywords() {
    return this.adminService.keywords()
  }

  @Post('keywords')
  createKeyword(@CurrentUser() user: AuthUser, @Body() dto: CreateKeywordDto) {
    return this.adminService.createKeyword(user.sub, dto)
  }

  @Delete('keywords')
  deleteKeyword(@Query('id') id: string) {
    return this.adminService.deleteKeyword(id)
  }
}
