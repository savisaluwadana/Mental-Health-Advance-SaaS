import { ConflictException, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { CreateKeywordDto, CreatePractitionerDto, UpdateUserDto } from './admin.dto'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [users, sessions, alerts, prescriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.session.count(),
      this.prisma.messageSafetyAlert.count({ where: { status: 'pending' } }),
      this.prisma.prescription.count(),
    ])

    return { stats: { users, sessions, pendingSafetyAlerts: alerts, prescriptions } }
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
}
