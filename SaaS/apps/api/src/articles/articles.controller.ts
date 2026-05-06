import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { JwtAuthGuard } from '../common/jwt-auth.guard'
import { Public } from '../common/public.decorator'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { ArticleQueryDto, CreateArticleDto } from './articles.dto'
import { ArticlesService } from './articles.service'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  list(@Query() query: ArticleQueryDto) {
    return this.articlesService.list(query)
  }

  @Public()
  @Get(':id')
  get(@Param('id') id: string) {
    return this.articlesService.get(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.articlesService.delete(id)
  }
}
