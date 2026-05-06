import { Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateClientProfileDto } from './clients.dto'

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    const clients = await this.prisma.user.findMany({
      where:
        user.role === Role.admin
          ? { role: Role.client }
          : {
              role: Role.client,
              clientProfile: { assignedPractitionerId: user.sub },
            },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        province: true,
        languages: true,
        clientProfile: true,
      },
    })
    return { clients }
  }

  async profile(userId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, province: true, languages: true } },
      },
    })
    return { profile }
  }

  async updateProfile(userId: string, dto: UpdateClientProfileDto) {
    const profile = await this.prisma.clientProfile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    })
    return { profile }
  }
}
