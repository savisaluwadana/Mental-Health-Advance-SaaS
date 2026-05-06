import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { CurrentUser } from '../common/current-user.decorator'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { AdminService } from './admin.service'
import { CreateKeywordDto, CreatePractitionerDto, UpdateUserDto } from './admin.dto'

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
