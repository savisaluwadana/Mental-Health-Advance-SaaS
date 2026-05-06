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
}
