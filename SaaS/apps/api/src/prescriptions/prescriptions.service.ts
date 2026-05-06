import { ForbiddenException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePrescriptionDto } from './prescriptions.dto'

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    const prescriptions = await this.prisma.prescription.findMany({
      where:
        user.role === Role.client
          ? { clientId: user.sub }
          : user.role === Role.psychiatrist
            ? { psychiatristId: user.sub }
            : user.role === Role.admin
              ? {}
              : { client: { clientProfile: { assignedPractitionerId: user.sub } } },
      include: {
        client: { select: { id: true, name: true, email: true } },
        psychiatrist: { select: { id: true, name: true, slmcRegNo: true } },
        medications: true,
      },
      orderBy: { issuedAt: 'desc' },
    })

    return { prescriptions }
  }

  async create(user: AuthUser, dto: CreatePrescriptionDto) {
    if (user.role !== Role.psychiatrist && user.role !== Role.admin) {
      throw new ForbiddenException('Only psychiatrists can issue prescriptions.')
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        clientId: dto.clientId,
        psychiatristId: user.sub,
        signatureDataUrl: dto.signatureDataUrl,
        sealDataUrl: dto.sealDataUrl,
        expiresAt: dto.expiresAt,
        medications: { create: dto.medications },
      },
      include: {
        medications: true,
        client: { select: { id: true, name: true } },
        psychiatrist: { select: { id: true, name: true, slmcRegNo: true } },
      },
    })

    return { prescription }
  }
}
