import { Injectable } from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PractitionerQueryDto } from './practitioners.dto'

@Injectable()
export class PractitionersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PractitionerQueryDto) {
    const where: Prisma.UserWhereInput = {
      role: query.role
        ? (query.role as Role)
        : { in: [Role.psychologist, Role.psychiatrist, Role.counsellor] },
      verified: true,
      ...(query.province ? { province: query.province } : {}),
      ...(query.language ? { languages: { has: query.language } } : {}),
      ...(query.sessionType || query.type ? { sessionTypes: { has: query.sessionType ?? query.type } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { specialty: { contains: query.search, mode: 'insensitive' } },
              { bio: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const practitioners = await this.prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        slmcRegNo: true,
        province: true,
        languages: true,
        specialty: true,
        bio: true,
        sessionTypes: true,
        verified: true,
      },
    })

    return { practitioners }
  }
}
