import { Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGoalDto } from './goals.dto'

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    const goals = await this.prisma.goal.findMany({
      where: user.role === Role.client ? { clientId: user.sub } : { practitionerId: user.sub },
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
}
