import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ArticleQueryDto, CreateArticleDto } from './articles.dto'

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ArticleQueryDto) {
    const articles = await this.prisma.article.findMany({
      where: query.category ? { category: query.category } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return { articles }
  }

  async create(dto: CreateArticleDto) {
    const article = await this.prisma.article.create({ data: dto })
    return { article }
  }

  async get(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } })
    return { article }
  }

  async update(id: string, dto: CreateArticleDto) {
    const article = await this.prisma.article.update({
      where: { id },
      data: dto,
    })
    return { article }
  }

  async delete(id: string) {
    await this.prisma.article.delete({ where: { id } })
    return { ok: true }
  }
}
