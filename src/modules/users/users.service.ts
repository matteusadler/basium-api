import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcryptjs'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        aiEnabled: true,
        waPhone: true,
        waConnectedAt: true,
        createdAt: true,
      },
    })
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        aiEnabled: true,
        aiSystemPrompt: true,
        aiWorkingHours: true,
        aiMaxMessages: true,
        aiTransferKeywords: true,
        waPhone: true,
        waConnectedAt: true,
        phoneNumberId: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return user
  }

  async create(companyId: string, dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ForbiddenException('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    return this.prisma.user.create({
      data: {
        companyId,
        email: dto.email,
        name: dto.name,
        passwordHash: hashedPassword,
        role: (dto.role || 'CORRETOR') as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
  }

  async update(id: string, companyId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const updateData: any = { ...dto }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10)
      delete updateData.password
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        aiEnabled: true,
        createdAt: true,
      },
    })
  }

  async updateOpenAIKey(userId: string, companyId: string, openaiKey: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    // Encrypt the OpenAI key with AES-256
    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured')
    }

    const encryptedKey = CryptoJS.AES.encrypt(openaiKey, encryptionKey).toString()

    return this.prisma.user.update({
      where: { id: userId },
      data: { openaiKey: encryptedKey },
      select: { id: true, aiEnabled: true },
    })
  }

  async getDecryptedOpenAIKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { openaiKey: true },
    })

    if (!user?.openaiKey) {
      return null
    }

    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured')
    }

    const bytes = CryptoJS.AES.decrypt(user.openaiKey, encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  async updateAIConfig(userId: string, companyId: string, config: any) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        aiEnabled: config.aiEnabled,
        aiSystemPrompt: config.aiSystemPrompt,
        aiWorkingHours: config.aiWorkingHours,
        aiMaxMessages: config.aiMaxMessages,
        aiTransferKeywords: config.aiTransferKeywords,
      },
      select: {
        id: true,
        aiEnabled: true,
        aiSystemPrompt: true,
        aiWorkingHours: true,
        aiMaxMessages: true,
        aiTransferKeywords: true,
      },
    })
  }

  async delete(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    // Soft delete - just deactivate
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
