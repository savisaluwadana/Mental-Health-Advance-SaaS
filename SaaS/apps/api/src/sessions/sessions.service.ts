import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSessionDto, UpsertSessionNoteDto } from './sessions.dto'

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    const sessions = await this.prisma.session.findMany({
      where:
        user.role === Role.client
          ? { clientId: user.sub }
          : user.role === Role.admin
            ? {}
            : { practitionerId: user.sub },
      orderBy: { scheduledAt: 'asc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
        practitioner: { select: { id: true, name: true, email: true, role: true, specialty: true } },
      },
    })

    return { sessions }
  }

  async create(user: AuthUser, dto: CreateSessionDto) {
    const practitioner = await this.prisma.user.findFirst({
      where: {
        id: dto.practitionerId,
        role: { in: [Role.psychologist, Role.psychiatrist, Role.counsellor] },
        verified: true,
      },
    })

    if (!practitioner) {
      throw new BadRequestException('Selected practitioner is unavailable.')
    }

    const session = await this.prisma.session.create({
      data: {
        clientId: user.sub,
        practitionerId: dto.practitionerId,
        scheduledAt: dto.scheduledAt,
        duration: dto.duration,
        type: dto.type,
        notes: dto.notes,
      },
      include: {
        practitioner: { select: { id: true, name: true, role: true, specialty: true } },
      },
    })

    return { session }
  }

  async note(user: AuthUser, sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } })
    if (!session || (user.role !== Role.admin && session.practitionerId !== user.sub)) {
      throw new ForbiddenException('Session notes are available only to the assigned practitioner.')
    }

    const note = await this.prisma.sessionNote.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: 'desc' },
    })

    return { note }
  }

  async upsertNote(user: AuthUser, sessionId: string, dto: UpsertSessionNoteDto) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } })
    if (!session || (user.role !== Role.admin && session.practitionerId !== user.sub)) {
      throw new ForbiddenException('Only the assigned practitioner can write this note.')
    }

    const existing = await this.prisma.sessionNote.findFirst({
      where: { sessionId, practitionerId: session.practitionerId },
    })

    const note = existing
      ? await this.prisma.sessionNote.update({
          where: { id: existing.id },
          data: { content: dto.content },
        })
      : await this.prisma.sessionNote.create({
          data: {
            sessionId,
            practitionerId: session.practitionerId,
            clientId: session.clientId,
            content: dto.content,
          },
        })

    return { note }
  }
}
