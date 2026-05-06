import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Role, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto, RegisterDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (existing) {
      throw new ConflictException('A user with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        hashedPassword,
        role: dto.role,
        phone: dto.phone,
        province: dto.province,
        languages: dto.languages ?? [],
        specialty: dto.specialty,
        bio: dto.bio,
        sessionTypes: dto.sessionTypes ?? [],
        verified: dto.role === Role.client,
        clientProfile: dto.role === Role.client ? { create: {} } : undefined,
      },
    })

    return this.authResponse(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.hashedPassword)
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password.')
    }

    return this.authResponse(user)
  }

  async me(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } })
    return this.toSafeUser(user)
  }

  private authResponse(user: User) {
    const safeUser = this.toSafeUser(user)
    return {
      user: safeUser,
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    }
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      province: user.province,
      languages: user.languages,
      specialty: user.specialty,
    }
  }
}
