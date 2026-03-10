import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { EmailService } from '../email/email.service'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(companyId: string, createdBy: string, inviterNameParam: string, data: {
    email: string
    name?: string
    role: string
    expiresInHours?: number
  }) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } })
    if (!company) throw new NotFoundException('Empresa não encontrada')
    const inviter = await this.prisma.user.findUnique({ where: { id: createdBy }, select: { name: true } })
    const inviterName = inviter?.name || inviterNameParam || 'Equipe Basium'

    const expiresInHours = data.expiresInHours || 48
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    const token = uuidv4()

    const invite = await this.prisma.inviteToken.create({
      data: {
        companyId,
        email: data.email,
        name: data.name,
        role: data.role,
        token,
        expiresAt,
        createdBy,
      }
    })

    const frontendUrl = process.env.FRONTEND_URL || 'https://basium-web.vercel.app'
    const inviteLink = `${frontendUrl}/invite/${token}`
    const expiresLabel = expiresInHours >= 24 ? `${expiresInHours / 24} dia(s)` : `${expiresInHours} hora(s)`

    await this.emailService.sendInvite({
      to: data.email,
      name: data.name || '',
      inviterName,
      companyName: company.name,
      role: data.role,
      inviteLink,
      expiresIn: expiresLabel,
    })

    return { success: true, invite }
  }

  async findAll(companyId: string) {
    return this.prisma.inviteToken.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async validate(token: string) {
    const invite = await this.prisma.inviteToken.findUnique({ where: { token } })
    if (!invite) throw new NotFoundException('Convite não encontrado')
    if (invite.usedAt) throw new BadRequestException('Este convite já foi utilizado')
    if (invite.expiresAt < new Date()) throw new BadRequestException('Este convite expirou')
    return {
      valid: true,
      email: invite.email,
      name: invite.name,
      role: invite.role,
    }
  }

  async accept(token: string, data: { name: string; password: string }) {
    const invite = await this.validate(token)

    const inviteRecord = await this.prisma.inviteToken.findUnique({ where: { token } })

    const existingUser = await this.prisma.user.findUnique({ where: { email: inviteRecord.email } })
    if (existingUser) throw new BadRequestException('Este email já está cadastrado')

    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await this.prisma.user.create({
      data: {
        companyId: inviteRecord.companyId,
        email: inviteRecord.email,
        name: data.name,
        passwordHash,
        role: inviteRecord.role as any,
        isActive: true,
        emailVerified: true,
      }
    })

    await this.prisma.inviteToken.update({
      where: { token },
      data: { usedAt: new Date() }
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }
}
