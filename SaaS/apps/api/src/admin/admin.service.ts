import { ConflictException, Injectable } from '@nestjs/common'
import { AlertStatus, PrescriptionStatus, Role, SessionStatus, SessionType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateKeywordDto,
  CreatePractitionerDto,
  UpdateAdminSessionDto,
  UpdatePlatformSettingsDto,
  UpdateSafetyAlertDto,
  UpdateUserDto,
} from './admin.dto'

@Injectable()
export class AdminService {
  private platformSettings = {
    platformName: 'SafeSpace Lanka',
    registrationsOpen: true,
    practitionerAutoVerify: false,
    crisisBannerEnabled: true,
    maintenanceMode: false,
    defaultSessionDuration: 60,
    supportedLanguages: ['English', 'Sinhala', 'Tamil'],
    supportEmail: 'support@safespacelanka.lk',
  }

  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [
      users,
      clients,
      practitioners,
      admins,
      pendingPractitioners,
      sessions,
      pendingSessions,
      confirmedSessions,
      completedSessions,
      cancelledSessions,
      pendingSafetyAlerts,
      escalatedSafetyAlerts,
      prescriptions,
      articles,
      keywords,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.client } }),
      this.prisma.user.count({ where: { role: { in: [Role.psychologist, Role.psychiatrist, Role.counsellor] } } }),
      this.prisma.user.count({ where: { role: Role.admin } }),
      this.prisma.user.count({
        where: {
          role: { in: [Role.psychologist, Role.psychiatrist, Role.counsellor] },
          verified: false,
        },
      }),
      this.prisma.session.count(),
      this.prisma.session.count({ where: { status: SessionStatus.pending } }),
      this.prisma.session.count({ where: { status: SessionStatus.confirmed } }),
      this.prisma.session.count({ where: { status: SessionStatus.completed } }),
      this.prisma.session.count({ where: { status: SessionStatus.cancelled } }),
      this.prisma.messageSafetyAlert.count({ where: { status: AlertStatus.pending } }),
      this.prisma.messageSafetyAlert.count({ where: { status: AlertStatus.escalated } }),
      this.prisma.prescription.count(),
      this.prisma.article.count(),
      this.prisma.keywordAlert.count(),
    ])

    return {
      stats: {
        users,
        clients,
        practitioners,
        admins,
        pendingPractitioners,
        sessions,
        pendingSessions,
        confirmedSessions,
        completedSessions,
        cancelledSessions,
        pendingSafetyAlerts,
        escalatedSafetyAlerts,
        prescriptions,
        articles,
        keywords,
      },
    }
  }

  async users(filters: { role?: string; search?: string }) {
    const users = await this.prisma.user.findMany({
      where: {
        ...(filters.role ? { role: filters.role as Role } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { slmcRegNo: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        province: true,
        languages: true,
        specialty: true,
        slmcRegNo: true,
        createdAt: true,
        clientProfile: true,
      },
    })
    return { users }
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        verified: dto.verified,
        role: dto.role,
        clientProfile: dto.assignedPractitionerId
          ? {
              upsert: {
                update: { assignedPractitionerId: dto.assignedPractitionerId },
                create: { assignedPractitionerId: dto.assignedPractitionerId },
              },
            }
          : undefined,
      },
      select: { id: true, name: true, email: true, role: true, verified: true },
    })
    return { user }
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } })
    return { ok: true }
  }

  async createPractitioner(dto: CreatePractitionerDto) {
    const practitionerRoles: Role[] = [Role.psychologist, Role.psychiatrist, Role.counsellor]
    if (!practitionerRoles.includes(dto.role)) {
      throw new ConflictException('Admin-created care providers must use a practitioner role.')
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (existing) {
      throw new ConflictException('A user with this email already exists.')
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        role: dto.role,
        hashedPassword: await bcrypt.hash(dto.password, 12),
        province: dto.province,
        languages: dto.languages ?? [],
        specialty: dto.specialty,
        bio: dto.bio,
        verified: true,
        sessionTypes: ['online', 'physical'],
      },
      select: { id: true, name: true, email: true, role: true, verified: true },
    })
    return { user }
  }

  async keywords() {
    const keywords = await this.prisma.keywordAlert.findMany({ orderBy: { keyword: 'asc' } })
    return { keywords }
  }

  async createKeyword(createdById: string, dto: CreateKeywordDto) {
    const category = dto.category === 'crisis' || dto.category === 'financial' ? dto.category : 'other'
    const keyword = await this.prisma.keywordAlert.upsert({
      where: { keyword: dto.keyword.toLowerCase() },
      update: { category },
      create: {
        keyword: dto.keyword.toLowerCase(),
        category,
        createdById,
      },
    })
    return { keyword }
  }

  async deleteKeyword(id: string) {
    await this.prisma.keywordAlert.delete({ where: { id } })
    return { ok: true }
  }

  async sessions(filters: { status?: string; type?: string; search?: string }) {
    const sessions = await this.prisma.session.findMany({
      where: {
        ...(filters.status ? { status: filters.status as SessionStatus } : {}),
        ...(filters.type ? { type: filters.type as SessionType } : {}),
        ...(filters.search
          ? {
              OR: [
                { client: { name: { contains: filters.search, mode: 'insensitive' } } },
                { client: { email: { contains: filters.search, mode: 'insensitive' } } },
                { practitioner: { name: { contains: filters.search, mode: 'insensitive' } } },
                { practitioner: { email: { contains: filters.search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        client: { select: this.userSummarySelect() },
        practitioner: { select: this.userSummarySelect() },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 250,
    })

    return { sessions }
  }

  async updateSession(id: string, dto: UpdateAdminSessionDto) {
    const session = await this.prisma.session.update({
      where: { id },
      data: {
        status: dto.status,
        meetingLink: dto.meetingLink,
        duration: dto.duration,
      },
      include: {
        client: { select: this.userSummarySelect() },
        practitioner: { select: this.userSummarySelect() },
      },
    })

    return { session }
  }

  async prescriptions(filters: { status?: string; search?: string }) {
    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        ...(filters.status ? { status: filters.status as PrescriptionStatus } : {}),
        ...(filters.search
          ? {
              OR: [
                { client: { name: { contains: filters.search, mode: 'insensitive' } } },
                { client: { email: { contains: filters.search, mode: 'insensitive' } } },
                { psychiatrist: { name: { contains: filters.search, mode: 'insensitive' } } },
                { psychiatrist: { email: { contains: filters.search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        client: { select: this.userSummarySelect() },
        psychiatrist: { select: this.userSummarySelect() },
        medications: true,
      },
      orderBy: { issuedAt: 'desc' },
      take: 250,
    })

    return { prescriptions }
  }

  async safetyAlerts(filters: { status?: string; search?: string }) {
    const alerts = await this.prisma.messageSafetyAlert.findMany({
      where: {
        ...(filters.status ? { status: filters.status as AlertStatus } : {}),
        ...(filters.search
          ? {
              OR: [
                { client: { name: { contains: filters.search, mode: 'insensitive' } } },
                { client: { email: { contains: filters.search, mode: 'insensitive' } } },
                { practitioner: { name: { contains: filters.search, mode: 'insensitive' } } },
                { practitioner: { email: { contains: filters.search, mode: 'insensitive' } } },
                { message: { content: { contains: filters.search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        client: { select: this.userSummarySelect() },
        practitioner: { select: this.userSummarySelect() },
        message: {
          select: {
            id: true,
            content: true,
            flagged: true,
            flagReasons: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 250,
    })

    return { alerts }
  }

  async updateSafetyAlert(id: string, dto: UpdateSafetyAlertDto) {
    const alert = await this.prisma.messageSafetyAlert.update({
      where: { id },
      data: { status: dto.status },
      include: {
        client: { select: this.userSummarySelect() },
        practitioner: { select: this.userSummarySelect() },
        message: {
          select: {
            id: true,
            content: true,
            flagged: true,
            flagReasons: true,
            createdAt: true,
          },
        },
      },
    })

    return { alert }
  }

  settings() {
    return { settings: this.platformSettings }
  }

  updateSettings(dto: UpdatePlatformSettingsDto) {
    this.platformSettings = { ...this.platformSettings, ...dto }
    return { settings: this.platformSettings }
  }

  private userSummarySelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      phone: true,
      province: true,
      specialty: true,
      slmcRegNo: true,
    } as const
  }
}
