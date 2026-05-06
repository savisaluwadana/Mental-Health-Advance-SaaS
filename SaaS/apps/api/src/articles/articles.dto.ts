import { IsOptional, IsString, MaxLength } from 'class-validator'

export class ArticleQueryDto {
  @IsOptional()
  @IsString()
  category?: string
}

export class CreateArticleDto {
  @IsString()
  title!: string

  @IsString()
  category!: string

  @IsString()
  desc!: string

  @IsOptional()
  @IsString()
  content?: string

  @IsString()
  readTime!: string

  @IsString()
  @MaxLength(2)
  marker!: string
}
