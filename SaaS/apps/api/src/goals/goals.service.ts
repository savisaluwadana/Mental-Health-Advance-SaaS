import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGoalDto, UpdateGoalDto } from './goals.dto'

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, clientId?: string) {
    const goals = await this.prisma.goal.findMany({
      where: user.role === Role.client ? { clientId: user.sub } : { practitionerId: user.sub, ...(clientId ? { clientId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
        practitioner: { select: { id: true, name: true, role: true } },
        weeklyCheckIns: { orderBy: { week: 'desc' } },
      },
    })

    return { goals }
  }

  async create(practitionerId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        practitionerId,
        clientId: dto.clientId,
        title: dto.title,
        description: dto.description,
        targetDate: dto.targetDate,
      },
    })

    return { goal }
  }

  async update(user: AuthUser, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: dto.id },
      include: { weeklyCheckIns: true },
    })

    if (!goal) throw new NotFoundException('Goal not found.')
    if (user.role === Role.client && goal.clientId !== user.sub) throw new ForbiddenException('Forbidden.')
    if (user.role !== Role.client && user.role !== Role.admin && goal.practitionerId !== user.sub) {
      throw new ForbiddenException('Forbidden.')
    }

    const updated = await this.prisma.goal.update({
      where: { id: dto.id },
      data: {
        completedAt: dto.completedAt === undefined ? undefined : dto.completedAt,
        weeklyCheckIns: dto.weeklyCheckIn
          ? {
              upsert: {
                where: { goalId_week: { goalId: dto.id, week: dto.weeklyCheckIn.week } },
                update: {
                  progressRating: dto.weeklyCheckIn.progressRating,
                  note: dto.weeklyCheckIn.note,
                },
                create: {
                  week: dto.weeklyCheckIn.week,
                  progressRating: dto.weeklyCheckIn.progressRating,
                  note: dto.weeklyCheckIn.note,
                },
              },
            }
          : undefined,
      },
      include: { weeklyCheckIns: { orderBy: { week: 'desc' } } },
    })

    return { goal: updated }
  }
}
