import { ForbiddenException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: AuthUser, id: string) {
    const canView = user.sub === id || user.role === Role.admin || user.role === Role.psychiatrist
    if (!canView) throw new ForbiddenException('Forbidden.')

    const profile = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        province: true,
        languages: true,
        specialty: true,
        slmcRegNo: true,
        sealDataUrl: true,
        verified: true,
      },
    })

    return { user: profile }
  }
}
