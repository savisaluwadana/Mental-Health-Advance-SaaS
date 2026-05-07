import { ForbiddenException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMoodEntryDto, MoodQueryDto } from './mood.dto'

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: MoodQueryDto) {
    const clientId = user.role === Role.client ? user.sub : query.clientId

    if (!clientId) {
      throw new ForbiddenException('Practitioners must provide a clientId to view shared mood entries.')
    }

    const entries = await this.prisma.moodEntry.findMany({
      where: {
        clientId,
        ...(user.role === Role.client ? {} : { sharedWithPractitioner: true }),
      },
      orderBy: { date: 'desc' },
      take: query.days ?? 30,
    })

    return { entries }
  }

  async upsert(clientId: string, dto: CreateMoodEntryDto) {
    const date = dto.date ? new Date(dto.date) : new Date()
    date.setUTCHours(0, 0, 0, 0)

    const entry = await this.prisma.moodEntry.upsert({
      where: {
        clientId_date: {
          clientId,
          date,
        },
      },
      update: {
        score: dto.score,
        emotions: dto.emotions,
        note: dto.note,
        sharedWithPractitioner: dto.sharedWithPractitioner ?? false,
      },
      create: {
        clientId,
        date,
        score: dto.score,
        emotions: dto.emotions,
        note: dto.note,
        sharedWithPractitioner: dto.sharedWithPractitioner ?? false,
      },
    })

    return { entry }
  }
}
