import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../common/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo')
    }

    const { passwordHash, ...result } = user
    return result
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    }
  }

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new UnauthorizedException('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create company first (trial)
    const company = await this.prisma.company.create({
      data: {
        name: data.companyName,
        planId: 'starter', // Default starter plan
        planStatus: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        companyId: company.id,
        role: 'ADMIN',
      },
    })

    // Create default pipeline
    const pipeline = await this.prisma.pipeline.create({
      data: {
        companyId: company.id,
        name: 'Vendas',
        type: 'SALE',
        isDefault: true,
        stages: {
          create: [
            { name: 'Novo Lead', color: '#6366f1', order: 1, probability: 10, type: 'INITIAL' },
            { name: 'Contato Feito', color: '#8b5cf6', order: 2, probability: 25, type: 'INTERMEDIATE' },
            { name: 'Visita Agendada', color: '#a855f7', order: 3, probability: 50, type: 'INTERMEDIATE' },
            { name: 'Proposta Enviada', color: '#c084fc', order: 4, probability: 75, type: 'INTERMEDIATE' },
            { name: 'Negociação', color: '#d8b4fe', order: 5, probability: 85, type: 'INTERMEDIATE' },
            { name: 'Ganho', color: '#10b981', order: 6, probability: 100, type: 'WON' },
            { name: 'Perdido', color: '#ef4444', order: 7, probability: 0, type: 'LOST' },
          ],
        },
      },
    })

    const { passwordHash, ...result } = user
    return this.login(result)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Usuário não encontrado')
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
    return { success: true }
  }
}
