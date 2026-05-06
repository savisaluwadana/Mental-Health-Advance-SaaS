import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { AlertStatus, Role } from '@prisma/client'
import { AuthUser } from '../common/auth-user'
import { PrismaService } from '../prisma/prisma.service'
import { MessageQueryDto, SendMessageDto } from './messages.dto'

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: MessageQueryDto) {
    const where = query.withUserId
      ? { conversationId: this.conversationId(user.sub, query.withUserId) }
      : { OR: [{ senderId: user.sub }, { receiverId: user.sub }] }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      take: 100,
    })

    return { messages }
  }

  async send(user: AuthUser, dto: SendMessageDto) {
    if (user.sub === dto.receiverId) {
      throw new BadRequestException('You cannot send a message to yourself.')
    }

    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } })
    if (!receiver) {
      throw new BadRequestException('Receiver not found.')
    }

    const senderIsClient = user.role === Role.client
    const receiverIsClient = receiver.role === Role.client
    if (senderIsClient === receiverIsClient && user.role !== Role.admin) {
      throw new ForbiddenException('Messages must be between a client and a practitioner.')
    }

    const keywords = await this.prisma.keywordAlert.findMany()
    const content = dto.content.toLowerCase()
    const reasons = keywords.filter((item) => content.includes(item.keyword.toLowerCase())).map((item) => item.keyword)
    const flagged = reasons.length > 0

    const message = await this.prisma.message.create({
      data: {
        conversationId: this.conversationId(user.sub, dto.receiverId),
        senderId: user.sub,
        receiverId: dto.receiverId,
        content: dto.content,
        flagged,
        flagReasons: reasons,
      },
    })

    if (flagged) {
      const clientId = senderIsClient ? user.sub : receiver.id
      const practitionerId = senderIsClient ? receiver.id : user.sub
      await this.prisma.messageSafetyAlert.create({
        data: {
          messageId: message.id,
          clientId,
          practitionerId,
          reasons,
        },
      })
    }

    return { message }
  }

  async alerts(user: AuthUser) {
    const alerts = await this.prisma.messageSafetyAlert.findMany({
      where: user.role === Role.admin ? {} : { practitionerId: user.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
        practitioner: { select: { id: true, name: true, email: true } },
        message: true,
      },
      take: 50,
    })
    return { alerts }
  }

  async updateAlert(id: string, status: 'acknowledged' | 'escalated') {
    const alert = await this.prisma.messageSafetyAlert.update({
      where: { id },
      data: { status: status as AlertStatus },
    })
    return { alert }
  }

  private conversationId(firstUserId: string, secondUserId: string) {
    return [firstUserId, secondUserId].sort().join(':')
  }
}
